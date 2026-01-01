//schema is defined for our users
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    userId:{
        type:String,
        required:true
    },
    dob:{
        type:Date,
        required:true
    },
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    currency:{
        type:String,
        required:true
    },
  },{
    timestamps:true
});
//decrypting password using bycrypt
userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

//a middleware to pre run process below before saving data so that password is encrypted before it is been saved
userSchema.pre('save', async function(next){
    //to check data modified or not isModified method is part of mongoose
    if(!this.isModified('password')){
        next();
    }
    //generating salt
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});
const User = mongoose.model('User',userSchema);
module.exports = User;