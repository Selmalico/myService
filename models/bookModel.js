const mongoose = require("mongoose");

const Book = mongoose.model(
  "books",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "authors",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    genres:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "genres"
    }],
    review: {
      rating: {
        type: Number,
        required: true,
      },
      votes: {
        type: Number,
        required: true,
      },
    },
    img: {
      type: String,
    }
  })
);

module.exports = Book;
