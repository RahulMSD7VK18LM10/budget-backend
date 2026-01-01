//jwt token generation
const jwt = require('jsonwebtoken');

//secrete key for token
//sending id as data
//loading env file - dev
//process.loadEnvFile();
const JWT_SECRETE = process.env.JWT_SECRETE;
const generateToken = (id) =>{
    return jwt.sign({ id },JWT_SECRETE,{
        expiresIn:'30d',
    })
    //30 d for 30 days
}

module.exports = generateToken;