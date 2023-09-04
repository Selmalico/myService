const Genres = require("../models/genreModel")
const Book = require("../models/bookModel");
const mongoose = require("mongoose");
const { connectDB } = require("../config/databaseConfig");

module.exports.updateGenre = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false; 
    await connectDB();

    try {
      const genreID = event.pathParameters.id;
      //Check if Id is valid
      if (!mongoose.Types.ObjectId.isValid(genreID)) {
        console.log('Provided Id is not mongo ObejctId')
        return {
            statusCode: 404,
            body: JSON.stringify({status: "error", error: "Provided id is not mongo ObjectId" }),
          };
      }
  
      let { name, bookIds } = JSON.parse(event.body);
  
      // Check if the genre exists
      const genre = await Genres.findById(genreID);
      if (!genre || genre.deleted) {
        console.log('Genre not found');
        return {
            statusCode: 404,
            body: JSON.stringify({status: "error", error: "Genre not found" })
        }
      }
      // Validate input fields
      if (!name) {
        console.log('Please provide genre name');
        return {
            statusCode: 400,
            body: JSON.stringify({status: "error", error: "Please provide name" }),
          };
      }
  
      //Check if name is valid
      // name = name.charAt(0).toUpperCase() + name.slice(1);
  
      // //Check if name is valid
      // if (!isValidGenre(name)) {
      //   return {
      //       statusCode: 404,
      //       body: JSON.stringify({ error: "Genre name is not valid" }),
      //     };
      // }
  
      if (bookIds && bookIds.length > 0) {
        const books = await Book.find({ _id: { $in: bookIds } });
    
        if (books.length === 0) {
          console.log('Provided book Ids are not correct')
            return {
                statusCode: 404,
                body: JSON.stringify({status: "error", error: "Provided book Ids are not correct" }),
            };
        }
    }    
  
      // Update the genre field
        genre.name = name;
        genre.books = books.map((book) => book._id);
  
      // Save the updated genre
      const updatedGenre = await genre.save();
  
       // Update the genres' books array
       books.forEach(async (book) => {
        if (!book.genres.includes(genreID)) {
          book.genres.push(genreID);
          await book.save();
        }
      });
      console.log('Genre updated successfully');
      return {
        statusCode: 200,
        body: JSON.stringify( updatedGenre),
      };;
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({status: "error", error: "An error occurred" }),
      };
    }
  };