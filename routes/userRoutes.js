const express = require("express");
const router = express.Router();
const {
  authUser,
  registerUser,
  changeUserPassword,
  updateProfile,
  deleteProfile,
  userExistCheck,
  sendEmail,
  getUserDetail
} = require("../controllers/userController");
//protect is a middleware to restrict usage without login
const protect = require("../middleware/authMiddleware");

//all the routes are defined here
router.route("/register").post(registerUser);
router.route("/login").post(authUser);
router.route("/changePassword").put(protect, changeUserPassword);
router.route("/updateProfile").put(protect, updateProfile);
router.route("/deleteProfile").delete(protect, deleteProfile);
router.route("/userExistCheck").post(userExistCheck);
router.route("/sendEmail").post(sendEmail);
//only for react native app to get user details
router.route("/getUserDetail").post(protect, getUserDetail);

module.exports = router;
