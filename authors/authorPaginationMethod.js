const Genre = require("../models/genreModel")
const Book = require("../models/bookModel")
const Author = require("../models/authorModel");
const mongoose = require("mongoose");
const {connectDB} = require("../config/databaseConfig");

module.exports.Authors = async (event, context) => { 
    context.callbackWaitsForEmptyEventLoop = false; 

  await connectDB();

  const search = event.queryStringParameters.search || "";
  const page = parseInt(event.queryStringParameters.page) || 1;
  const ITEM_PER_PAGE = 6;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  try {
    const count = await Author.countDocuments(query);
    const pageCount = Math.ceil(count / ITEM_PER_PAGE);

    const allAuthorsData = await Author.find(query)
      .skip((page - 1) * ITEM_PER_PAGE)
      .limit(ITEM_PER_PAGE)
      .populate("books");

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
        authorsData: allAuthorsData,
      }),
    };
  } catch (error) {
    console.error('Something went wrong getting authors', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({status: "error", error: "An error occurred" }),
    };
  }
}