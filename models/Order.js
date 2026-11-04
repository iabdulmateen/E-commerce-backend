
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  qty: {
    type: Number,
    required: true,
    min: 1
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  imageUrl: {
    type: String,
    default: ''
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },

    customerInfo: {
      name: {
        type: String,
        default: 'Guest Customer',
        trim: true
      },

      email: {
        type: String,
        default: '',
        trim: true,
        lowercase: true
      },

      phone: {
        type: String,
        default: '',
        trim: true
      }
    },

    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'Order must contain at least one product'
      }
    },

    shippingAddress: {
      address: {
        type: String,
        required: true,
        trim: true
      },

      city: {
        type: String,
        required: true,
        trim: true
      },

      postalCode: {
        type: String,
        required: true,
        trim: true
      },

      country: {
        type: String,
        required: true,
        trim: true
      }
    },

    paymentMethod: {
      type: String,
      required: true,
      default: 'Cash on Delivery'
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    isPaid: {
      type: Boolean,
      required: true,
      default: false
    },

    paidAt: {
      type: Date
    },

    isDelivered: {
      type: Boolean,
      required: true,
      default: false
    },

    deliveredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
