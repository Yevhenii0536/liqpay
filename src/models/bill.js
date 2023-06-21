const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  clientID: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paymentStatus: {
    type: String,
    default: 'pending',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const Bill = mongoose.model('Bill', billSchema);

module.exports = {
  Bill,
};
