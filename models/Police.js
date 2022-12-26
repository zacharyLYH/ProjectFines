const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

const PoliceSchema = new mongoose.Schema({
    badgenumber:{
        type:String,
        required: [true, 'Please provide a badge number'],
        unique:true
    },
    password:{
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6,
    },
    role:{
        type: String,
        default:'police'
    },
    loginHistory:{
        type: [Date]
    },
    ticketingHistory:{
        type: [mongoose.Schema.ObjectID],
        ref:'Offense',
        default: []
    }
}, {timestamps:true})

PoliceSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });
  
PoliceSchema.methods.comparePassword = async function (canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password);
    return isMatch;
};
  
  module.exports = mongoose.model('Police', PoliceSchema);