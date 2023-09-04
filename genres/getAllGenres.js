const mongoose = require("mongoose");
const Book = require("../models/bookModel");
const Genres = require("../models/genreModel");
const { connectDB } = require("../config/databaseConfig");

module.exports.getAllGenres = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectDB();
    try {
      const genres = await Genres.find()
      .populate("books", "title")
      .select("-__v -deleted");

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(genres)
      }
    } catch (error) {
      console.error(error);
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
