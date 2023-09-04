const mongoose = require("mongoose");

const Subscribe = mongoose.model(
  "subscribers",
  new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
  })
);

module.exports = Subscribe;