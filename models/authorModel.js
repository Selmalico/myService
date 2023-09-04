const mongoose = require("mongoose");

const Author = mongoose.model(
  "authors",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    nationality: {
      type: String,
      required: true,
    },
    books: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "books",
      },
    ],
    img : {
      type: String,
    }
  })
);

module.exports = Author;
