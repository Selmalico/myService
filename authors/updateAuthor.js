const AWS = require("aws-sdk");
const mongoose = require("mongoose");
const { connectDB } = require("../config/databaseConfig");
const Author = require("../models/authorModel");
const lambda = new AWS.Lambda();

module.exports.updateAuthor = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();

  try {
    const authorID = event.pathParameters.id;
    const stringJsonBody = event.body;
    let { name, email, nationality, books, img } = JSON.parse(stringJsonBody);

    if (!mongoose.Types.ObjectId.isValid(authorID)) {
      console.log('Provided Id is not Mongo ObjectId');
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({status: "error", error: "Provided Id is not Mongo ObjectId" }),
      };
    }

    const invokeParams = {
      FunctionName: "bookservice-dev-uploadImage",
      Payload: JSON.stringify({ img }),
    };
    const invokeResult = await lambda.invoke(invokeParams).promise();
    const uploadResult = JSON.parse(invokeResult.Payload);
    console.log(event.body);
    console.log(name);
    if (!name || !nationality) {
      console.log('Please provide all required fields');
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({status: "error", error: "Please provide all required fields" }),
      };
    }

    const author = await Author.findById(authorID);
    if (!author) {
      console.log('Author not found');
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({status: "error", message:"Author not found"}),
      };
    }
    const nameRegEx = /^[a-zA-Z]+ [a-zA-Z]{2,30}$/;
    if (!nameRegEx.test(name)) {
      console.log('Name contains invaild characters');
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({status: "error", message: "Name is not valid"}),
      };
    }

    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegEx.test(email)) {
      console.log('Email is not valid');
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({status: "error", message: "Email is not valid"}),
      };
    }

    author.name = name;
    author.email = email;
    author.nationality = nationality;
    author.img = uploadResult.body;
    const updatedAuthor = await author.save();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(updatedAuthor),
    };
  } catch (error) {
    console.error('Something went wrong while updating author',error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        status: "error",
        message: "An error occurred while updating author",
        error: error.message
      }),
    };
  }
};
