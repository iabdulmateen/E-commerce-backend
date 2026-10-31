const Order = require('../models/Order');

const inMemoryOrders = [];

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice, customerInfo } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: 'No order items in cart' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ error: 'Please provide full shipping address' });
    }

    const userId = req.user ? req.user._id : null;

    if (Order.db && Order.db.readyState === 1) {
      const order = await Order.create({
        user: userId,
        customerInfo: customerInfo || { name: req.user?.name || 'Guest Customer' },
        orderItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'Cash on Delivery',
        totalPrice: Number(totalPrice) || 0,
      });
      return res.status(201).json(order);
    }

    const mockOrder = {
      _id: 'order_' + Date.now(),
      user: userId,
      customerInfo: customerInfo || { name: req.user?.name || 'Guest Customer' },
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      totalPrice: Number(totalPrice) || 0,
      isPaid: false,
      isDelivered: false,
      createdAt: new Date(),
    };
    inMemoryOrders.unshift(mockOrder);
    return res.status(201).json(mockOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    if (Order.db && Order.db.readyState === 1) {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      return res.json(orders);
    }

    const userOrders = inMemoryOrders.filter((o) => o.user === req.user._id);
    return res.json(userOrders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (Order.db && Order.db.readyState === 1) {
      const order = await Order.findById(id).populate('user', 'name email');
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.json(order);
    }

    const order = inMemoryOrders.find((o) => o._id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    if (Order.db && Order.db.readyState === 1) {
      const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
      return res.json(orders);
    }

    return res.json(inMemoryOrders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
};
