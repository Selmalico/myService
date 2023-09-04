const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-18',
    region: 'eu-west-1',
    params: {
      UserPoolId: process.env.UserPoolId
    }
  });
const mongoose = require('mongoose');
const { connectDB } = require("../config/databaseConfig");
const User = require("../models/userModel");

module.exports.updateUser = async (event) => {
    await connectDB();
    
    const {username, name, birthday, email} = event;
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
    
    try {
        await cognito.adminUpdateUserAttributes(params).promise();
        
        // Update user in MongoDB
        await User.updateOne({username}, {$set: {name, birthday, email}});
        
        return {success: true};
    } catch (error) {
        return {success: false, error: error.message};
    }
};
