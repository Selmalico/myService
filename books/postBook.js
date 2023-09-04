const mongoose = require('mongoose');
const Book = require("../models/bookModel"); 
const Author = require('../models/authorModel'); 
const Genres = require('../models/genreModel'); 
const { connectDB } = require('../config/databaseConfig');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

module.exports.postBook = async (event, context) => {
  console.log(JSON.stringify(event));
  context.callbackWaitsForEmptyEventLoop = false; 

  await connectDB();

  try {
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
    if (!title ) {
      console.log('Title is required');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Please provide title field" }),
      };
    }
    if (!author ) {
      console.log('Author is required');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Please provide author field" }),
      };
    }
    if (!genreIds ) {
      console.log('Genre is required');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Please provide genre field" }),
      };
    }
    if (!rating ) {
      console.log('Rating is required');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Please provide rating field" }),
      };
    }
    if (!votes ) {
      console.log('Votes are required');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Please provide votes field" }),
      };
    }

    // Check if title is valid
    if (title.length < 2 || title.length > 30) {
      console.log('Title length is not valid');
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
      console.log('Title can not support this character');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Non valid characters in title" }),
      };
    }

    if (!mongoose.Types.ObjectId.isValid(author)) {
      console.log('Provided author Id is not mongo Id');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Invalid author Id" }),
      };
    }

    const existingAuthor = await Author.findById(author);
    if (!existingAuthor) {
      console.log('Author not found');
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "error", error: "Author not found" }),
      };
    }

    if (isNaN(price) || price < 5 || price > 1000) {
      console.log('Price is not valid');
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

    if (rating < 1 || rating > 10 ) {
      console.log('Rating must be gratter then 1 and less then 10');
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
      console.log('Votes are positive number');
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
      const book = new Book({
        title,
        author,
        genres: genres.map((genre) => genre._id), 
        price,
        review: { rating, votes },
        img: uploadResult.body,
      });

      // Save the book
      const savedBook = await book.save();

      // Update author's books array
      existingAuthor.books.push(savedBook._id);
      await existingAuthor.save();

      // Update genres' books array
      genres.forEach(async (genre) => {
        genre.books.push(savedBook._id);
        await genre.save();
      });

      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(savedBook),
      };
  } catch (error) {
    console.log('Something went wrong while posting book', error);
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
