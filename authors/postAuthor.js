const AWS = require("aws-sdk");
const mongoose = require("mongoose");
const { connectDB } = require("../config/databaseConfig");
const Author = require("../models/authorModel");
const lambda = new AWS.Lambda();

module.exports.postAuthor = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();

  try {
    const stringJsonBody = event.body;
    let { name, email, nationality, books, img } = JSON.parse(stringJsonBody);

    const invokeParams = {
      FunctionName: 'bookservice-dev-uploadImage', 
      Payload: JSON.stringify({ img }),
    };
    const invokeResult = await lambda.invoke(invokeParams).promise();
    const uploadResult = JSON.parse(invokeResult.Payload);

    if (!name ) {
      console.log('Name is required');
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({status: "error", error: "Please provide name required fields" }),
      };
    }

    if (!nationality ) {
      console.log('Nationality is required');
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({status: "error", error: "Please provide nationality required fields" }),
      };
    }

    const nameRegEx = /^[a-zA-Z]+ [a-zA-Z]{2,30}$/;
    if (!nameRegEx.test(name)) {
      console.log('Name contaid invalid characters');
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({status: "error", message:"Name is not valid"}),
      };
    }
    const checkNameExist = await Author.findOne({ name: name });
    if (checkNameExist) {
      console.log('This author already exist');
      return {
        statusCode: 409,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "This author already exists" }),
      };
    }

    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegEx.test(email)) {
      console.log('Email is not valid');
      return { statusCode: 404,headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        }, body: JSON.stringify("Email is not valid") };
    }

    const author = new Author({
      name,
      email,
      nationality,
      books,
      img: uploadResult.body,
    });
    const savedAuthor = await author.save();

    return { statusCode: 200,headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        }, body: JSON.stringify(savedAuthor) };
  } catch (error) {
    console.error('Something went wrong while creating author', error);
    return {
      statusCode: 500,
      headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
      body: JSON.stringify({
        status: "error",
        message: "An error occurred while creating author",
      }),
    };
  }
};
