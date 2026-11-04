
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

const checkDatabase = (res) => {
  if (!Order.db || Order.db.readyState !== 1) {
    res.status(503).json({
      error: 'Database service unavailable. Please try again later.'
    });
    return false;
  }

  return true;
};

const isValidId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) &&
    String(id).length === 24;
};

// @desc Create new order
// @route POST /api/orders
// @access Guest & Authenticated
const createOrder = async (req, res, next) => {
  try {
    if (!checkDatabase(res)) return;

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      customerInfo
    } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        error: 'No order items in cart'
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.address?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.postalCode?.trim() ||
      !shippingAddress.country?.trim()
    ) {
      return res.status(400).json({
        error: 'Please provide complete shipping address'
      });
    }

    // Verify every product against MongoDB.
    // Never trust price, name or image sent by the browser.
    const cleanedOrderItems = [];
    let calculatedTotal = 0;

    for (const item of orderItems) {
      const rawProduct = item.product || item._id || item.id;

      const productId =
        typeof rawProduct === 'object'
          ? rawProduct._id || rawProduct.id
          : rawProduct;

      if (!productId || !isValidId(String(productId))) {
        return res.status(400).json({
          error: 'Invalid product ID in order'
        });
      }

      const quantity = Number(item.qty ?? item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          error: 'Product quantity must be a positive whole number'
        });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          error: `Product not found: ${productId}`
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}`
        });
      }

      const itemPrice = Number(product.price);

      cleanedOrderItems.push({
        name: product.name,
        qty: quantity,
        price: itemPrice,
        imageUrl: product.imageUrl || '',
        product: product._id
      });

      calculatedTotal += itemPrice * quantity;
    }

    calculatedTotal = Math.round(
      (calculatedTotal + Number.EPSILON) * 100
    ) / 100;

    const order = await Order.create({
      user: req.user?._id || undefined,

      customerInfo: {
        name: customerInfo?.name || req.user?.name || 'Guest Customer',
        email: customerInfo?.email || req.user?.email || '',
        phone: customerInfo?.phone || ''
      },

      orderItems: cleanedOrderItems,

      shippingAddress: {
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country.trim()
      },

      paymentMethod: paymentMethod || 'Cash on Delivery',

      // Calculated from actual database product prices.
      totalPrice: calculatedTotal
    });

    // Notify connected admin dashboard.
    const io = req.app.get('io');

    if (io) {
      io.to('admin-room').emit('new-order', order);
      console.log('NEW ORDER EMITTED:', order._id);
    } else {
      console.warn('Socket.IO instance not available');
    }

    return res.status(201).json(order);

  } catch (error) {
    next(error);
  }
};

// @desc Get logged-in user's orders
// @route GET /api/orders/myorders
// @access Private
const getMyOrders = async (req, res, next) => {
  try {
    if (!checkDatabase(res)) return;

    const orders = await Order.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    return res.json(orders);

  } catch (error) {
    next(error);
  }
};

// @desc Get order by ID
// @route GET /api/orders/:id
// @access Private
const getOrderById = async (req, res, next) => {
  try {
    if (!checkDatabase(res)) return;

    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id)
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    // Admin can view all orders.
    // Customers can only view their own orders.
    const isAdmin = req.user.role === 'admin';
    const isOwner =
      order.user &&
      String(order.user._id || order.user) === String(req.user._id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        error: 'Not authorized to view this order'
      });
    }

    return res.json(order);

  } catch (error) {
    next(error);
  }
};

// @desc Get all orders
// @route GET /api/orders
// @access Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    if (!checkDatabase(res)) return;

    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return res.json(orders);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders
};
