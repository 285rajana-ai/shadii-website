const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true }, // e.g. basic, standard, premium, gold, platinum
    label: { type: String, required: true },
    price: { type: Number, required: true }, // in PKR
    duration: { type: Number, required: true }, // days
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
