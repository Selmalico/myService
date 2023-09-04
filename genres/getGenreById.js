const Genres = require("../models/genreModel")
const Book = require("../models/bookModel")
const Author = require("../models/authorModel");
const mongoose = require("mongoose");
const {connectDB} = require("../config/databaseConfig");

module.exports.getGenre = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectDB();
    try {
      const genreId = event.pathParameters.id;
      //Check if id is valid
      if (!mongoose.Types.ObjectId.isValid(genreId)) {
        console.log("Provided Id is not Mongo ObjectId");
        return{
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({error:"Provided Id is not Mongo ObjectId" })
      };
    }
  
      // Find the genre by ID
      const genre = await Genres.findById(genreId)
      .populate({
        path: "books",
        select: "title author price review",
        populate: {
          path: "author", 
          select: "name" 
        }
      })
      .select("-__v");
      if (!genre) {
        console.log('Genre not found');
        return {
            statusCode:404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({status: "error", message: "Genre not found" })
      };
    }
      console.log('Genres data', genre)
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify( genre )
      };
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