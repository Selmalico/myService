const mongoose = require("mongoose");

const Contact = mongoose.model(
  "contact",
  new mongoose.Schema({
    email: {
      type: String,
      required: true,
    },
    message: {
        type: String, 
        required: true
    }
  })
);

module.exports = Contact;