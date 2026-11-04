
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Check database connection
const checkDatabase = (res) => {
  if (!Product.db || Product.db.readyState !== 1) {
    res.status(503).json({
      error: 'Database service unavailable. Please try again later.'
    });
    return false;
  }

  return true;
};

// Validate MongoDB ObjectId
const isValidId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) &&
    String(new mongoose.Types.ObjectId(id)) === id;
};

// Validate numeric fields
const isValidNumber = (value, min = 0) => {
  return value !== undefined &&
    value !== null &&
    value !== '' &&
    Number.isFinite(Number(value)) &&
    Number(value) >= min;
};

// @desc Fetch all products
// @route GET /api/products
// @access Public
const getProducts = async (req, res, next) => {
  try {
    if (!checkDatabase(res)) return;

    const { keyword, category } = req.query;

    const filter = {};

    if (keyword) {
      filter.name = {
        $regex: String(keyword),
        $options: 'i'
      };
    }

    if (category) {
      filter.category = String(category);
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 });

    return res.json(products);

  } catch (error) {
    next(error);
  }
};

// @desc Fetch single product
// @route GET /api/products/:id
// @access Public
const getProductById = async (req, res, next) => {
  try {
    if (!checkDatabase(res)) return;

    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        error: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    return res.json(product);

  } catch (error) {
    next(error);
  }
};

// @desc Create product
// @route POST /api/products
// @access Private/Admin
const createProduct = async (req, res, next) => {
  try {
    if (!checkDatabase(res)) return;

    const {
      name,
      description,
      price,
      category,
      stock,
      imageUrl
    } = req.body;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof description !== 'string' ||
      !description.trim() ||
      typeof category !== 'string' ||
      !category.trim() ||
      !isValidNumber(price) ||
      (stock !== undefined && !isValidNumber(stock))
    ) {
      return res.status(400).json({
        error: 'Please provide valid name, description, price, category, and stock'
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      stock: stock !== undefined ? Number(stock) : 0,
      imageUrl: imageUrl || 'https://placehold.co/600x400?text=Product+Image'
    });

    return res.status(201).json(product);

  } catch (error) {
    next(error);
  }
};

// @desc Update product
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    if (!checkDatabase(res)) return;

    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        error: 'Invalid product ID'
      });
    }

    const {
      name,
      description,
      price,
      category,
      stock,
      imageUrl
    } = req.body;

    if (
      (name !== undefined && (typeof name !== 'string' || !name.trim())) ||
      (description !== undefined && (typeof description !== 'string' || !description.trim())) ||
      (category !== undefined && (typeof category !== 'string' || !category.trim())) ||
      (price !== undefined && !isValidNumber(price)) ||
      (stock !== undefined && !isValidNumber(stock))
    ) {
      return res.status(400).json({
        error: 'Invalid product update data'
      });
    }

    const updates = {};

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) updates.price = Number(price);
    if (category !== undefined) updates.category = category.trim();
    if (stock !== undefined) updates.stock = Number(stock);
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    return res.json(product);

  } catch (error) {
    next(error);
  }
};

// @desc Delete product
// @route DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    if (!checkDatabase(res)) return;

    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        error: 'Invalid product ID'
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    return res.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
