const mongoose = require('mongoose');

const salesReportSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    revenue: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    orders: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.SalesReport || mongoose.model('SalesReport', salesReportSchema);
