const mongoose = require('mongoose');
const Book = require("../models/bookModel"); 
const Author = require('../models/authorModel'); 
const Genres = require('../models/genreModel'); 
const { connectDB } = require('../config/databaseConfig');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

module.exports.updateBook = async (event, context) => {
  console.log(JSON.stringify(event));
  context.callbackWaitsForEmptyEventLoop = false; 

  await connectDB();

  try {
    const bookId = event.pathParameters.id;
    if (!mongoose.Types.ObjectId.isValid(bookId)){
      console.log('Provided id is not Mongo Obejct Id');
        return {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({status: "error", error: 'Provided Id is not mongo ObjectId' }),
          };
    }
    const stringJsonBody = event.body;
    const { title, author, genreIds, price, rating, votes, img } = JSON.parse(stringJsonBody);

    if (!img) {
      console.log(img)
      console.log('Image is required');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: 'Image is required' }),
      };
    }
    const invokeParams = {
      FunctionName: 'bookservice-dev-uploadImage', 
      Payload: JSON.stringify({ img }),
    };
    const invokeResult = await lambda.invoke(invokeParams).promise();
    const uploadResult = JSON.parse(invokeResult.Payload);
    console.log(uploadResult);
    // Validate input fields
    if (!title || !author || !price || !rating || !votes) {
      console.log('Provide all required fields');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Please provide all required fields" }),
      };
    }
    const book = await Book.findById(bookId);
    if(!book){
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

    // Check if title is valid
    if (title.length < 2 || title.length > 30) {
      console.log('Title length must be more then 2 and less than 30');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Title is not valid" }),
      };
    }
    const titleRegEx = /^[a-zA-Z0-9 ,.?!"']+$/;
    if (!titleRegEx.test(title)) {
      console.log('Title not valid');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Non valid characters in title" }),
      };
    }
    const authorData = await Author.findOne({_id: author})
    if(!authorData){
      console.log('Author not found');
        return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({status: "error", error: "Author not found" }),
          };
    }
    if (!mongoose.Types.ObjectId.isValid(author)) {
      console.log('Provided author id is not Mongo Obejct Id');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Invalid author Id" }),
      };
    }

    if (isNaN(price) || price < 5 || price > 1000) {
      console.log('Price must be more than 5 ');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Price is not valid" }),
      };
    }

    const parsedRating = parseFloat(rating);
    const parsedVotes = parseInt(votes);

    if (parsedRating < 1 || parsedRating > 10) {
      console.log('Rating is not valid');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Rating is not valid" }),
      };
    }

    if (votes < 0) {
      console.log('Votes must be > 0');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Votes number is not valid" }),
      };
    }
   
    const genres = await Genres.find({ _id: { $in: genreIds } });
        book.title = title;
        book.author = author;
        book.genres = genres.map((genre) => genre._id), 
        book.price = price;
        book.review = { rating: parsedRating, votes: parsedVotes };
        book.img = uploadResult.body;

      // Save the book
      const updatedBook = await book.save();

      if (!authorData.books.includes(bookId)) {
        authorData.books.push(bookId);
        await authorData.save();
      }
  
      // Update the genres' books array
      genres.forEach(async (genre) => {
        if (!genre.books.includes(bookId)) {
          genre.books.push(bookID);
          await genre.save();
        }
      });

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(updatedBook),
      };
  } catch (error) {
    console.log('Something went wrong while updating book', error);
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
