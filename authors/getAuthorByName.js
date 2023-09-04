const AWS = require("aws-sdk");
const mongoose = require("mongoose");
const Author = require("../models/authorModel"); // replace with your actual Author model path
const { connectDB } = require("../config/databaseConfig");

module.exports.getByName = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  try {
    const authorName = event.queryStringParameters.name;

    const author = await Author.findOne({
      name: { $regex: new RegExp(authorName, "i") },
    });
    if (!author) {
      console.log('Author not found');
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({status: "error", error: "Author not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(author),
    };
  } catch (error) {
    console.error('Something went wrong finding author with provided name', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        status: "error",
        error: "An error occurred while fetching the author",
      }),
    };
  }
};
