const mongoose = require('mongoose');
const { connectDB } = require("../config/databaseConfig");
const User = require("../models/userModel");
const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18',
  region: 'eu-west-1',
  params: {
    UserPoolId: process.env.UserPoolId
  }
});


module.exports.postUser = async (event, context) => {
  console.log(JSON.stringify(event));
  context.callbackWaitsForEmptyEventLoop = false;

  await connectDB();

  try {
    const stringJsonBody = event.body;
    const { name,username, birthday, email, password } =
      JSON.parse(stringJsonBody);

    if (!name || !username || !birthday || !email || !password) {
      console.log("Please provide all the required fields");
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          status: "error",
          error: "Please provide all the required fields",
        }),
      };
    }
    const nameRegEx = /^[a-zA-Z]+ [a-zA-Z]{2,30}$/;
    if (!nameRegEx.test(name)) {
      console.log("Name contaid invalid characters");
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ status: "error", message: "Name is not valid" }),
      };
    }

    const birthdayValidation = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdayValidation.test(birthday)) {
      console.log("Apologize but user must be between 18 and 80 years old");
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          status: "error",
          message: "Apologize but user must be between 18 and 80 years old",
        }),
      };
    }

    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegEx.test(email)) {
      console.log("Email is not valid");
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          status: "error",
          message: "Email is not valid",
        }),
      };
    }

    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log("Invalid password format");
      return {
        statusCode: 400,
        body: JSON.stringify({
          error:
            "Invalid password format! Password must be at least 8 characters long and should contain at least one number, one letter and one symbol.",
        }),
      };
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log("Username already exists");
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: "Username already exists! Try a different one.",
        }),
      };
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log("Email already exists");
      return {
        statusCode: 409,
        body: JSON.stringify({
          error:
            "Email already exists! Try a different one or try to login to your account.",
        }),
      };
    }

    const params = {
        ClientId: '5065r68fg4i4l1pg3olrfjqac6',
        Username: email,
        Password: password,


        UserAttributes: [
            {
                Name: 'name',
                Value: name
            },
            {
                Name: 'birthdate',
                Value: birthday
            },
            {
                Name: 'email',
                Value: email
            },
            {
              Name: 'preferred_username',
              Value: username
            },
        ]
    };

    const signUp = await cognito.signUp(params).promise();
    const user = new User({
      name,
      username,
      birthday,
      email,
    });
    await user.save();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
    };
  } catch (error) {
    console.error('Something went wrong while register user', error);
    return {
      statusCode: 500,
      headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
      body: JSON.stringify({
        status: "error",
        message: "An error occurred while registerin the user",
      }),
    };
  }
};
