const AWS = require("aws-sdk");
const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const User = require("../models/userModel"); // You need to import your User model
const { connectDB } = require("../config/databaseConfig");

module.exports.getOrder = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();

  // Get the email from the event
  const email = event.requestContext.authorizer.claims.email;

  try {
    // Find the user with this email in the database
    const user = await User.findOne({ email });
    if (!user) return { statusCode: 404, body: "User not found" };

    // Use the user's id to fetch the order
    const order = await Order.findOne({ user: user._id }).populate("items.book");
    if (!order) return { statusCode: 404, body: "Cart not found" };
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(order),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "An error occurred while retrieving the cart",
    };
  }
};
