const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price must be greater than or equal to 0'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    imageUrl: {
      type: String,
      default: 'https://placehold.co/600x400?text=Product+Image',
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    oldPrice: {
      type: Number,
    },
    discount: {
      type: Number,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for 'image' so both product.image and product.imageUrl work
productSchema.virtual('image').get(function () {
  return this.imageUrl;
});

// Virtual for 'id' string so both product.id and product._id work
productSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('Product', productSchema);
