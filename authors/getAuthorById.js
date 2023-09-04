const Book = require("../models/bookModel")
const Author = require("../models/authorModel");
const mongoose = require("mongoose");
const {connectDB} = require("../config/databaseConfig");

module.exports.getAuthor = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false; 

    await connectDB();
  
    try {
      const authorId = event.pathParameters.id;
  
      //Check if Id is MongoId
      if (!mongoose.Types.ObjectId.isValid(authorId)) {
        console.log('Provided Id is not Mongo ObjectId');
        return {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({status: "error", error: "Provided Id is not mongo ObjectId" }),
          };
      }
  
      const author = await Author.findById(authorId).populate("books", "title price review img");
      if (!author) {
        console.log('Author not found');
        return {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({status: "error", error: "Author not found" }),
          };
      } else {
        return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(author),
          };
      }
    } catch (error) {
      console.log('Something went wrong getting author', error);
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