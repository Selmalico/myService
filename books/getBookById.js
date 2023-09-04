const mongoose = require('mongoose');
const Book = require('../models/bookModel'); 
const Author = require('../models/authorModel');
const Genres = require('../models/genreModel')
const { connectDB } = require('../config/databaseConfig');

module.exports.getById = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false; 

  await connectDB();

  try {
    const bookId = event.pathParameters.id;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      console.log('Provided Id is not Mongo Id');
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Id provided is not Mongo Id" }),
      };
    }

    // Get the book by ID
    const book = await Book.findById(bookId)
      .select("-__v")
      .populate("author", "name email nationality")
      .populate("genres", "name");

    if (!book) {
      console.log('Book not found');
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Book not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(book),
    };
  } catch (error) {
    console.log('Something went wrong while getting book', error);
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