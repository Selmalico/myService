const mongoose = require("mongoose");

const BookGenre = mongoose.model(
  "bookgenre",
  new mongoose.Schema({
    genreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "genres",
    },
    bookIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "books",
      },
    ],
  })
);

module.exports = BookGenre;
