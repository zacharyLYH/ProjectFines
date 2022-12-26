const mongoose = require('mongoose')
const Offenses = require('./Offense')

const CarSchema = new mongoose.Schema({
    carPlate:{
        type:String,
        required:[true,'Please provide license plate']
    },
    titleID:{
        type:String,
        required:[true,'Please provide title id']
    },
    insuranceID:{
        type:String,
        required:[true,'Please provide insurance id']
    },
    insurerName:{
        type:String,
        enum:['safe driving','liberty'],
        required:[true,'Please provide insurer name']
    },
    ownerMongoID:{
        type:mongoose.Types.ObjectId,
        ref: 'User',
        required:true
    },
    offensesIncurred:{
        type: [mongoose.Types.ObjectId],
        ref: 'Offense',
    },
    imagesOfThisCar:{
        type:[String],
        required:[true,'Provide images asked for of the vehicle']
    }
})

module.exports = mongoose.model('Car', CarSchema);