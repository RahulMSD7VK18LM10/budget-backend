const express = require('express');
const router = express.Router();
const {addTnx, getAllTnx, deleteTnx, updateTnx} = require('../controllers/tnxController');
//protect is a middleware to restrict usage without login
const protect = require('../middleware/authMiddleware'); 

//all the routes are defined here
router.route('/addTnx').post(protect, addTnx);
router.route('/getAllTnx').get(protect, getAllTnx);
router.route('/deleteTnx/:tnxId').delete(protect, deleteTnx);
router.route('/updateTnx').patch(protect, updateTnx);

module.exports = router;