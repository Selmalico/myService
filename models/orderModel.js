const mongoose = require("mongoose");

const Order = mongoose.model(
  "orders",
  new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", 
      required: true,
    },
    items: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "books", 
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1, 
        },
      },
    ],
  })
);

module.exports = Order;
