const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
    username:{
        type:String,
        required: [true, 'Please provide a username'],
        unique:true
    },
    password:{
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6,
    },
    role:{
        type: String,
        default:'admin'
    },
}, {timestamps:true})

AdminSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });
  
AdminSchema.methods.comparePassword = async function (canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password);
    return isMatch;
};
  
  module.exports = mongoose.model('Admin', AdminSchema);