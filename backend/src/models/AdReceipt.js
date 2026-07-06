const mongoose = require('mongoose');

const adReceiptSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true }, // in PKR
    date: { type: Date, required: true },
    receiptUrl: { type: String, required: true }, // URL to image/document
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdReceipt', adReceiptSchema);
