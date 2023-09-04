const mongoose = require("mongoose");

const Genres = mongoose.model(
  "genres",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    books: [{
      type: mongoose.Schema.Types.ObjectId,
      ref:"books"
    }]
  })
);

module.exports = Genres;
