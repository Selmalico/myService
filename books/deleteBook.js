const mongoose = require('mongoose');
const Book = require("../models/bookModel"); 
const Author = require('../models/authorModel'); 
const Genres = require('../models/genreModel'); 
const { connectDB } = require('../config/databaseConfig');
const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
});

const s3 = new AWS.S3();

module.exports.deleteBook = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectDB();
    try {
        const bookID = event.pathParameters.id;

        if (!mongoose.Types.ObjectId.isValid(bookID)) {
            console.log('Provided Id is not Mongo Id');
            return { 
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                  },
                body: JSON.stringify({status: "error", error: "Id is not Mongo Id" }) 
            };
        }

        const book = await Book.findById(bookID);
        if (!book) {
            console.log('Book not found');
            return { 
                statusCode: 404,
                headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
              }, 
              body: JSON.stringify({status: "error", message: "Book not found" }) };
        }

        const imageKey = book.img.split('folder/').pop();

        const s3Params = {
            Bucket: process.env.BUCKET_NAME,
            Key: imageKey,
        };
        await s3.deleteObject(s3Params).promise();

        const author = await Author.findById(book.author);

        if (author) {
            author.books.pull(bookID);
            await author.save();
        }

        const genres = await Genres.find({ _id: { $in: book.genres } });
        genres.forEach(async (genre) => {
            genre.books.pull(bookID);
            await genre.save();
        });

        await Book.deleteOne({ _id: bookID });
        
        return { 
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
              },
            body: JSON.stringify({status: "success", message: "Book deleted successfully" }) 
        };
    } catch (error) {
        console.error('Something went wrong while deleting books', error);
        return { 
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
              },
            body: JSON.stringify({status: "error", error: "An error occurred" }) 
        };
    }
};