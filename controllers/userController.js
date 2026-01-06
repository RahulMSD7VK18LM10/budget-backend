//contains all the user related logics
const User = require("../models/userModel");
const Tnx = require("../models/tnxModel");
const asyncHandler = require("express-async-handler");
const generateToken = require('../utils/generateToken');
const jwt = require("jsonwebtoken");
// const JWT_SECRETE = "RAHULISCHAMPION";
const nodemailer = require("nodemailer");
//loading env file - dev
//process.loadEnvFile();
const JWT_SECRETE = process.env.JWT_SECRETE;
const transporter = nodemailer.createTransport({
  service: "Gmail", 
  auth: {
    user: process.env.COMPANY_EMAIL,
    pass: process.env.COMPANY_PASSWORD
  },
  connectionTimeout: 10000, // 10 sec
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// @desc Auth user & get token
// @route POST /api/user/login
// @access Public
//login a user and authorizing by generating a jwt token
exports.authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      userId:user.userId,
      userName: user.userName,
      email: user.email,
      password: user.password,
      dob:user.dob,
      currency:user.currency,
      token:generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

// @desc Register a new user
// @route POST /api/user/register
// @access Public
exports.registerUser = asyncHandler(async (req, res) => {
  const { dob, userName, email, password, currency } = req.body;
  const userExists = await User.findOne({ email });
  //checking if user already exist
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  //create is syntactic suger for save method so it will work
  // if user is created the send data as response
  const nam = userName.length>3?userName.slice(0,4):userName;
  const randNo = Math.floor(Math.random()*1000);
  const userId= nam + '/' + dob + randNo ;
  const user = await User.create({
    userId,
    dob,
    userName,
    email,
    password,
    currency,
  });
  //generating token while creating user so that he is authorized
  if (user) {
    res.status(201);
    res.json({
      _id: user._id,
      userId:user.userId,
      userName: user.userName,
      email: user.email,
      password: user.password,
      dob:user.dob,
      currency:user.currency,
      token: generateToken(user._id),
    });
  }
  else {
    res.status(400);
    throw new Error("Invalid User Data");
  }
});

// @desc change password
// @route PUT /api/user/changePassword
// @access Private
exports.changeUserPassword = asyncHandler(async (req, res) => {
  let token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token,JWT_SECRETE);
  const {email, password, newPassword } = req.body;
  const userExists = await User.findOne({ _id:decoded.id});
  //checking if user already exist
  if (userExists) {
    //check if email = email in db
    if(email===userExists.email){
      //chekc if enterd password matches password from db
      if(await userExists.matchPassword(password)){
        //update password logic
        userExists.password=newPassword;
        if(userExists.save()){
          res.json(true);
        }
      }
      //error password do not exist
      else{
        console.log("password incorrect")
        res.json("Passowrd does not match");
      }
    }//else invalid email error
    else{
      console.log("invalid email")
      res.json("Invalid Email, Please Check");
    }
  }//if user do not exist then error
  else{
    console.log(" ckjodsbvuygjhsvldsghsjdkvyuchsdv")
    res.status(404);
    throw new Error("User cannot be found");
  }
});

// @desc update profile
// @route PUT /api/user/updateProfile
// @access Private
exports.updateProfile = asyncHandler(async (req, res) => {
  try{
    let token = req.headers.authorization.split(" ")[1];
    const decoded = await jwt.verify(token,JWT_SECRETE);
    const {userName, email, currency, dob } = req.body;
    const userExists = await User.findOne({ _id:decoded.id});
    //checking if user already exist
    if (userExists) {
      userExists.userName=userName;
      userExists.email=email;
      userExists.currency=currency;
      userExists.dob=dob?dob:userExists.dob
      userExists.save();
      res.json(true);
    }
    else{
      res.status(404);
      throw new Error("User cannot be found");
    }
  }catch(error){
    console.log(error)
  }
});

// @desc delete profile
// @route DELETE /api/user/deleteProfile
// @access Private
exports.deleteProfile = asyncHandler(async (req, res) => {
  let token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token,JWT_SECRETE);
  const userExists = await User.findOne({ _id:decoded.id});
  if (userExists) {
    //logic to delete from db here and also remove data from tnxes
    await User.findByIdAndDelete({_id:decoded.id});
    await Tnx.deleteMany({user:decoded.id});
    res.json(true);
  }
  else{
    res.status(404);
    throw new Error("User cannot be found");
  }
});

// @desc user exist check for email sending
// @route POST /api/user/userExists
// @access Private
exports.userExistCheck = asyncHandler(async (req, res) => {
  const {email} = req.body;
  console.log(email)
  const userExists = await User.findOne({email:email});
  if (userExists) {
    console.log('user is there')
    res.json(true);
  }
  else{
    console.log('user is not there')
    res.json(false);
  }
});

// @desc sending email
// @route POST /api/user/sendEmail
// @access Private
exports.sendEmail = asyncHandler(async (req, res) => {
  console.log("api called")
  const {email, email_context} = req.body;
  //logic for sending otp via email
  if(email_context==="OTP"){
    const otp = Math.floor(100000 + Math.random() * 900000);
    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject: "One Time Password - BUDGET",
      html: `<p>Hello user,
              <br/>
              <br/>
              We have received a request for One-Time Password (OTP). Your OTP is ${otp}.
              Kindly note that your OTP is private only to you, thus, do not share the same with anyone.
              <br/>
              Furthermore, in case of any query, please feel free to get in touch with us at customer.experience@bugdettrack.i
              <br/>
              <br/>
              Thanks & Regards
              Team Budget</p>`
    };
    console.log("📤 Sending OTP email...");
    // await transporter.sendMail(mailOptions, (error, info) => {
    //   console.log(info)
    //    if(error){
    //      return res.status(500).send(error);
    //    }
    //    console.log(otp)
    //    res.status(200).json(otp);
    // });
    await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent");
    return res.status(200).json({ otp });
  }
  //logic for sending temporary password for login
  else if(email_context==="PASSWORD"){
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let tempPassword = "";
    for (let i = 0; i < 8; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject: "TEMPORARY PASSWORD - BUDGET",
      html: `<p>Hello user,
              <br/>
              <br/>
              Please use this password ${tempPassword} to login.
              Kindly note that this password is private only to you, thus, do not share the same with anyone.
              <br/>
              Please make sure to <b>Change your password</b> after login for security purposes.
              <br/>
              Furthermore, in case of any query, please feel free to get in touch with us at customer.experience@bugdettrack.i
              <br/>
              <br/>
              Thanks & Regards<br/>
              Team Budget</p>`
    };
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if(error){
    //     return res.status(500).send(error);
    //   }
    //   else{
    //     res.status(200).json(true);
    //   }
    // });
      console.log("📤 Sending password email...");
      await transporter.sendMail(mailOptions);
      console.log("✅ Password email sent");
    try {
      const userDataFromEmail = await User.findOne({ email: email });
      userDataFromEmail.password = tempPassword; 
      await userDataFromEmail.save(); // await here
      res.status(200).json({ message: "Temporary password sent and saved" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  else{
    console.log("No")
  }
});

// @desc get user detail
// @route POST /api/user/getUserDetail
// @access Private
//only for react native app to get user detail by userId
exports.getUserDetail = asyncHandler(async (req, res) => {
  const headerAuth = req.headers.authorization;
  if(!headerAuth || !headerAuth.startsWith("Bearer ")){
    res.status(401);
    throw new Error("Not authorized, token missing");
  }
  else{
    const {userId} = req.body;
    const userData = await User.findOne({ userId:userId});
    if (userData) {
      res.json({
        userId:userData.userId,
        userName: userData.userName,
        email: userData.email,
        dob:userData.dob,
        currency:userData.currency,
      });
    }
    else{
      res.status(404);
      throw new Error("User cannot be found");
    }
  }
});
