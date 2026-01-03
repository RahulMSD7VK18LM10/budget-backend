// db connection is set here
const mongoose = require('mongoose');
//for prod
require("dotenv").config(); // ✅ CORRECT

//loading env file
//process.loadEnvFile();
const mongoURI_dev = process.env.MONGO_CONNECTION_URL_DEV;
const mongoURI_prod = process.env.MONGO_CONNECTION_URL_PROD;

// Select the right Mongo URI based on NODE_ENV
const mongoURI = process.env.NODE_ENV === 'prod' ? mongoURI_prod : mongoURI_dev;


const connectToMongo = ()=>{
    mongoose.connect(mongoURI).then(()=>{
    console.log("Connected to mongo successfully");
    }).catch((err)=>{
        console.error(err);
        process.exit(1);
    })
}

module.exports = connectToMongo;