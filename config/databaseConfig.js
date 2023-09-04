const mongoose = require('mongoose');
require('dotenv').config();

module.exports.connectDB = async () => {
try{
    mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {useNewUrlParser: true, 
    useUnifiedTopology: true,})
    console.log("Connected to database")
} catch (err) {
    console.log("Something went wrong when connecting to the database", err);
}
}
