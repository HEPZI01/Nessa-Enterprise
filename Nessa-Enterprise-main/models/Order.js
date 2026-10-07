const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      sparse: true
    },
    userId: {
      type: Number,
      required: true
    },
    customerName: {
      type: String,
      default: 'Customer'
    },
    customerEmail: {
      type: String,
      default: ''
    },
    productId: {
      type: Number,
      required: true
    },
    productName: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    paymentMethod: {
      type: String,
      default: 'COD'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
