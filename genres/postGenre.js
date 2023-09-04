const Genres = require("../models/genreModel");
const Book = require("../models/bookModel");
const mongoose = require("mongoose");
const { connectDB } = require("../config/databaseConfig");

module.exports.postGenre = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  connectDB();

  try {
    let { name, bookIds } = JSON.parse(event.body);
    name = name.charAt(0).toUpperCase() + name.slice(1);

    // Check if name is valid
    // if (!isValidGenre(name)) {
    //   return {
    //       statusCode: 404,
    //       body: JSON.stringify({message: "Genre name is not valid"})
    //   }
    // }

    const checkNameExist = await Genres.findOne({ name: name });
    if (checkNameExist) {
      console.log("Genre name already exist");
      return {
        statusCode: 409,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({status: "error", message: "Genre name already exist" }),
      };
    }

    // Find the books associated with the provided bookIds
    if (bookIds && bookIds.length > 0) {
      const books = await Book.find({ _id: { $in: bookIds } });

      if (books.length === 0) {
        console.log("Provided book Ids are not correct");
        return {
          statusCode: 404,
          body: JSON.stringify({status: "error", error: "Provided book Ids are not correct" }),
        };
      }
    }

    // Create a new genre
    const genre = new Genres({
      name,
      books: books.map((book) => book._id),
    });

    // Save the genre
    const savedGenre = await genre.save();

    // Update each book's genres array with the new genreId
    books.forEach(async (book) => {
      book.genres.push(savedGenre._id);
      await book.save();
    });
    
    console.log('Genre added successfully');
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(savedGenre),
    };
  } catch (error) {
    console.log('General error');
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({status: "error", message: "An error occurred" }),
    };
  }
};
