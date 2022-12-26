const mongoose = require('mongoose')

const OffenseSchema = new mongoose.Schema({
    policeThatIssuedOffenseID: {
        type: mongoose.Types.ObjectId,
        ref: 'Police',
        required: true,
    },
    imageEvidence: {
        type:[String],
    },
    offenseType:{
        type:String,
        enum:['drunkDriving', 'speeding'],
        required: true,
    },
    policeThatIssuedOffenseBadgenumber: {
        type: String,
        required: true,
    },
    carPlate:{
        type: String,
        required: true,
    },
    resolvedOrNot:{
        type:String,
        enum:['false', 'true', 'processing', 'invalidated', 'late'],
        default:'false'
    },
    resolvedDateTime:{
        type: Date
    },
    notes:{
        type:String
    }
}, {timestamps:true})

module.exports = mongoose.model('Offense', OffenseSchema);