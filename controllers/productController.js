const Product = require('../models/Product');

// Sample initial products for fallback or offline browsing
let inMemoryProducts = [
  {
    _id: 'prod_1',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium wireless over-ear headphones with active noise cancellation and 30-hour battery life.',
    price: 199.99,
    category: 'Electronics',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    createdAt: new Date(),
  },
  {
    _id: 'prod_2',
    name: 'Minimalist Mechanical Keyboard',
    description: 'Compact mechanical keyboard with hot-swappable switches and custom RGB backlighting.',
    price: 89.99,
    category: 'Electronics',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    createdAt: new Date(),
  },
  {
    _id: 'prod_3',
    name: 'Ergonomic Desk Chair',
    description: 'Breathable mesh ergonomic office chair with adjustable lumbar support and 3D armrests.',
    price: 249.00,
    category: 'Furniture',
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1580481077194-54c30c8052cf?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    createdAt: new Date(),
  },
];

// @desc    Fetch all products (with optional keyword and category filter)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { keyword, category } = req.query;

    // MongoDB Connected
    if (Product.db && Product.db.readyState === 1) {
      let filter = {};
      if (keyword) {
        filter.name = { $regex: keyword, $options: 'i' };
      }
      if (category) {
        filter.category = category;
      }

      const products = await Product.find(filter).sort({ createdAt: -1 });

      // If database is empty, seed initial sample products
      if (products.length === 0 && Object.keys(filter).length === 0) {
        const seeded = await Product.insertMany(
          inMemoryProducts.map(({ _id, ...p }) => p)
        );
        return res.json(seeded);
      }

      return res.json(products);
    }

    // Fallback in-memory
    let filtered = [...inMemoryProducts];
    if (keyword) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    if (category) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }
    return res.json(filtered);
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (Product.db && Product.db.readyState === 1) {
      const product = await Product.findById(id);
      if (product) {
        return res.json(product);
      }
      return res.status(404).json({ error: 'Product not found' });
    }

    const item = inMemoryProducts.find((p) => p._id === id);
    if (item) {
      return res.json(item);
    }
    return res.status(404).json({ error: 'Product not found' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        error: 'Please provide name, description, price, and category',
      });
    }

    if (Product.db && Product.db.readyState === 1) {
      const product = await Product.create({
        name,
        description,
        price: Number(price),
        category,
        stock: stock !== undefined ? Number(stock) : 0,
        imageUrl: imageUrl || 'https://placehold.co/600x400?text=Product+Image',
      });
      return res.status(201).json(product);
    }

    const newProduct = {
      _id: 'prod_' + Date.now(),
      name,
      description,
      price: Number(price),
      category,
      stock: stock !== undefined ? Number(stock) : 0,
      imageUrl: imageUrl || 'https://placehold.co/600x400?text=Product+Image',
      rating: 4.5,
      createdAt: new Date(),
    };
    inMemoryProducts.unshift(newProduct);
    return res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, imageUrl } = req.body;

    if (Product.db && Product.db.readyState === 1) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      product.name = name ?? product.name;
      product.description = description ?? product.description;
      product.price = price !== undefined ? Number(price) : product.price;
      product.category = category ?? product.category;
      product.stock = stock !== undefined ? Number(stock) : product.stock;
      product.imageUrl = imageUrl ?? product.imageUrl;

      const updated = await product.save();
      return res.json(updated);
    }

    const index = inMemoryProducts.findIndex((p) => p._id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    inMemoryProducts[index] = {
      ...inMemoryProducts[index],
      name: name ?? inMemoryProducts[index].name,
      description: description ?? inMemoryProducts[index].description,
      price: price !== undefined ? Number(price) : inMemoryProducts[index].price,
      category: category ?? inMemoryProducts[index].category,
      stock: stock !== undefined ? Number(stock) : inMemoryProducts[index].stock,
      imageUrl: imageUrl ?? inMemoryProducts[index].imageUrl,
    };

    return res.json(inMemoryProducts[index]);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (Product.db && Product.db.readyState === 1) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      await product.deleteOne();
      return res.json({ message: 'Product deleted successfully' });
    }

    const index = inMemoryProducts.findIndex((p) => p._id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    inMemoryProducts.splice(index, 1);
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
