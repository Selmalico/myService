const { connectDB } = require('../config/databaseConfig');
const Book = require('../models/bookModel'); 
const Author = require('../models/authorModel');
const Genres = require('../models/genreModel')

module.exports.getAllBooks = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false; 
  await connectDB();
  try {

    const books = await Book.find({})
      .select("-__v")
      .populate("author", "name email nationality")
      .populate("genres", "name");

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(books),
    };
  } catch (error) {
    console.log('This is a general error', error);
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