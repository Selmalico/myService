const Genres = require("../models/genreModel")
const Book = require("../models/bookModel")
const mongoose = require("mongoose");
const {connectDB} = require("../config/databaseConfig");

module.exports.deleteGenre = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false; 
    await connectDB();

    try {
      const genreId = event.pathParameters.id;
  
      //Check if Id is valid
      if (!mongoose.Types.ObjectId.isValid(genreId)) {
        console.log("Provided Id is not Mongo ObjectId")
        return{
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({error:"Provided Id is not Mongo ObjectId" })
      };
      }
  
      // Check if the genre exists
      const genre = await Genres.findById(genreId);
      if (!genre) {
        console.log('Genre not found')
        return{
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({ error: "Genre not found" })
        }
      }
  
      const books = await Book.find({ genres: genreId });
  
      // Remove the genre from each book's genres array
      await Promise.all(
        books.map(async (book) => {
          book.genres = book.genres.filter((genre) => genre.toString() !== genreId);
          await book.save();
        })
      );
      
      await Genres.findByIdAndDelete(genreId);
  
      return{
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "success", message: "Genre deleted successfully" })
      }
    } catch (error) {
      console.error(error);
      return{
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "An error occurred" })
      }
    }
  }