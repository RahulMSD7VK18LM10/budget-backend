//middleware to protect route
const jwt = require("jsonwebtoken");
const asyncHandler = require('express-async-handler');
const User = require("../models/userModel");

//loading env file -dev
//process.loadEnvFile();
const JWT_SECRETE = process.env.JWT_SECRETE;
const protect = asyncHandler(async (req, res, next) => {
    let token;
    // checking for token and wheather it has bearer or not
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //taking token form headers
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token,JWT_SECRETE);
        // console.log(decoded)
        //getting data except password form db on the basis of token
        req.user = await User.findById({_id:decoded.id}).select('-password');
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Not Authorized, invalid token");
    }
  }
  // if token is not found
  if(!token){
    res.status(401);
    throw new Error('Not Authorized, no token found');
  }
});

module.exports = protect;