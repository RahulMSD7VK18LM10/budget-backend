const express = require('express');
const app= express();
const cors = require('cors');
const connectToMongo = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const tnxRoutes = require('./routes/tnxRoutes');
const {notFound, errorHandler} = require('./middleware/errorMiddleware');


//loading env file - dev
// process.loadEnvFile();
//prod
require('dotenv').config();
//calling db connection function
connectToMongo();
//i am using cors
app.use(cors());

//this middleware allow us to accept json data in body
app.use(express.json())

//adding routing
app.use('/api/users',userRoutes);
app.use('/api/transaction',tnxRoutes);

//custom middleware for 404 not found
app.use(notFound);

//custom middleware for error handling
app.use(errorHandler);
app.get('/',(req,res)=>{
    res.send("Api is running");
})

// ✅ IMPORTANT: Dynamic PORT for Render
const PORT = process.env.PORT || 8000;

app.listen(PORT,console.log("server running on port 8000"))