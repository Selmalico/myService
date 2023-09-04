const AWS = require("aws-sdk");
const mongoose = require("mongoose");
const { connectDB } = require("../config/databaseConfig");
const Contact = require("../models/contactModel");

module.exports.postContact = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  connectDB();
  try {
    const { email, message } = JSON.parse(event.body);

    if (!email || !message) {
      console.log('Please provide all required fields');
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify("Please provide all required fields"),
      };
    }

    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegEx.test(email)) {
      console.log('Email is not vaild');
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify("Email is not valid"),
      };
    }

    const problem = new Contact({
      email,
      message,
    });

    const savedProblem = await problem.save();

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(savedProblem),
    };
  } catch (error) {
    console.error('Error while tyring to contact', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify("Something went wrong"),
    };
  }
};
