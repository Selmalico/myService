const AWS = require("aws-sdk");
const Subscribe = require("../models/subscribeModel");
const { connectDB } = require("../config/databaseConfig");
module.exports.complete = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  try {
    const { email } = event.pathParameters;
    if (!email) {
      console.log('Invalid confirmation link');
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: "Invalid confirmation link.",
      };
    }

    const newSubscriber = new Subscribe({ email });
    await newSubscriber.save();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "Thank you for confirming your subscription!",
    };
  } catch (error) {
    console.error("Error confirming subscription:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "Failed to confirm subscription.",
    };
  }
};
