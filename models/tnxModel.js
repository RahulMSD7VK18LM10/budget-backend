//schema for all transactions
const mongoose = require('mongoose');
const { Schema } = mongoose;

const tnxSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        require:true,
        ref:'User'
    },
    amount:{
        type:Number,
        required:true,
    },
    totalAmount:{
        type:Number,
    },
    category:{
        type:String,
        required:true,
    },
    txnType:{
        type:String,
        required:true
    },
    dateOfTnx:{
        type:String,
    },
    note:{
        type:String,
    },
  },{
    timestamps:true
  });
const Tnx = mongoose.model('Tnx',tnxSchema);
module.exports = Tnx;