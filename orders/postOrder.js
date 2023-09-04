
const AWS = require("aws-sdk");
const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const User = require('../models/userModel')
const { connectDB } = require("../config/databaseConfig");

module.exports.postOrder = async (event, context) => {
  console.log(event);
  context.callbackWaitsForEmptyEventLoop = false;
  const { bookId, quantity } = JSON.parse(event.body);

  const email = event.requestContext.authorizer.claims.email;
  
  await connectDB();

  try {
    const user = await User.findOne({ email });
    if (!user) return { statusCode: 404, body: "User not found" };

    const order = await Order.findOne({ user: user._id })

    if (order) {
      // Order exists for user
      let itemIndex = order.items.findIndex((item) => item.book == bookId);

      if (itemIndex > -1) {
        // Book exists in the order, update the quantity
        let item = order.items[itemIndex];
        item.quantity = quantity;
        order.items[itemIndex] = item;
      } else {
        // Book does not exist in order, add new item
        order.items.push({ book: bookId, quantity });
      }
      order = await order.save();
      return {
        statusCode: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(order),
      };
    } else {
      // No order for user, create new order
      const newOrder = await Order.create({
        user: userId,
        items: [{ book: bookId, quantity }],
      });

      return {
        statusCode: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(newOrder),
      };
    }
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "Something went wrong",
    };
  }
};
