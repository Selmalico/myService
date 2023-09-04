const AWS = require("aws-sdk");
const { connectDB } = require("../config/databaseConfig");
const mongoose = require("mongoose");
const Author = require("../models/authorModel");
const Book = require("../models/bookModel");

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
});

const s3 = new AWS.S3();

module.exports.deleteAuthor = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  try {
    const authorId = event.pathParameters.id;

    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      console.log('Provided Id is not Mongo ObjectId');
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ error: "Author Id is not Mongo Id" }),
      };
    }

    const author = await Author.findById(authorId);
    if (!author) {
      console.log('Author not found');
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ error: "Author not found" }),
      };
    }

    const imageKey = author.img.split("/").pop();

    const s3Params = {
      Bucket: process.env.BUCKET_NAME,
      Key: imageKey,
    };
    await s3.deleteObject(s3Params).promise();

    const books = await Book.find({ author: authorId });

    await Book.deleteMany({ author: authorId });

    await Author.findByIdAndDelete(authorId);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({status: "error", message: "Author deleted successfully" }),
    };
  } catch (error) {
    console.error('Something went wrong while deleting author', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({status: "error", error: "An error occurred" }),
    };
  }
};
