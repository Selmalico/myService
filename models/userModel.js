const mongoose = require("mongoose");

const User = mongoose.model(
  "users",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true
    },
    birthday: {
      type: Date,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
        type: String,
        required: true
    }
  })
);

module.exports = User;