const mongoose = require('mongoose');
const User = require("../models/userModel");
const {connectDB} = require("../config/databaseConfig")

module.exports.deleteGenre = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false; 
    await connectDB();

    try {
      const userId = event.pathParameters.id;
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
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
  
      const user = await User.findById(userId);
      if (!user) {
        console.log('User not found')
        return{
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({ error: "User not found" })
        }
      }
      
      await User.findByIdAndDelete(userId);
  
      return{
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({status: "success", message: "User deleted successfully" })
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