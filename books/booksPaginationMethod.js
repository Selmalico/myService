const mongoose = require('mongoose');
const Book = require('../models/bookModel'); 
const Author = require('../models/authorModel'); 
const Genres = require('../models/genreModel'); 
const Subscribe = require('../models/subscribeModel'); 
const { connectDB } = require('../config/databaseConfig');

module.exports.getFilterSort = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false; 

  await connectDB();

  const search = event.queryStringParameters.search || "";
  const page = parseInt(event.queryStringParameters.page) || 1;
    const authorId = event.queryStringParameters.authorId || null;
    const sort = event.queryStringParameters.sort || "";
    const ITEM_PER_PAGE = 6;
  
    const query = {};
  
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
  
    if (authorId) {
      query.author = authorId;
    }
  
    // Check if a sort parameter is provided and handle it accordingly
    const sortOptions = {};
    if (sort === "low") {
      sortOptions.price = 1;
    } else if (sort === "high") {
      sortOptions.price = -1;
    }
  
    try {
      const count = await Book.countDocuments(query);
      const pageCount = Math.ceil(count / ITEM_PER_PAGE);
  
      let allBooksData;
  
      if (sort) {
        allBooksData = await Book.find(query)
          .sort(sortOptions) // Use the provided sort options
          .skip((page - 1) * ITEM_PER_PAGE)
          .limit(ITEM_PER_PAGE)
          .populate("author")
          .populate("genres", "name");
      } else {
        // If no sort parameter, just apply filters without sorting
        allBooksData = await Book.find(query)
          .skip((page - 1) * ITEM_PER_PAGE)
          .limit(ITEM_PER_PAGE)
          .populate("author","name")
          .populate("genres", "name");
      }
  
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          Pagination: {
            count,
            pageCount,
          },
        booksData: allBooksData,
      }),
    };
    } catch (error) {
      console.log('Something went wrong while getting books', error);
        return {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({ error: "An error occurred" }),
          };
    }
  };