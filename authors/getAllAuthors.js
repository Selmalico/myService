const Book = require("../models/bookModel")
const Author = require("../models/authorModel");
const mongoose = require("mongoose");
const {connectDB} = require("../config/databaseConfig");

module.exports.getAllAuthors = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false; 

    await connectDB();
  
    try {
      const authors = await Author.find({}).populate("books", "title price review");
      return{
        statusCode:200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(authors)
      }
    } catch (error) {
      console.log('Something went wrong getting all authors', error);
        return {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({status: "error", error: "An error occurred" }),
          };
    }
  };