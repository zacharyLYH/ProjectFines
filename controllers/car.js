const Car = require('../models/Car')
const User = require('../models/User')
const CustomErrors = require('../errors')
const { StatusCodes } = require('http-status-codes')
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const Offense = require('../models/Offense')
const {checkPermissions} = require('../utils')

const addCar = async (req,res) => {
    const {userMongoID} = req.user
    req.body.ownerMongoID = userMongoID
    const newCar = await Car.create(req.body)
    const addCar = await User.findOne({_id:userMongoID})
    addCar.cars.push(newCar._id)
    await addCar.save()
    res.status(StatusCodes.OK).json(newCar)
}

const uploadImageAddCar = async (req, res) => {
    const result = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
        use_filename: true,
        folder: 'cars',
      }
    );
    //console.log(req.files.image.tempFilePath);
    fs.unlinkSync(req.files.image.tempFilePath);
    return res.status(StatusCodes.OK).json(result.secure_url);
  };

const getCar = async (req,res) => {
    const car = await Car.findOne({_id:req.params.id})
    if(!car){
        throw new CustomErrors.BadRequestError(`Car with id ${req.params.id} doesn't exist`)
    }
    checkPermissions(req.user, car.ownerMongoID)
    res.status(StatusCodes.OK).json(car)
}

const getAllCars = async (req,res) => {
    const {userMongoID} = req.user
    const car = await Car.find({ownerMongoID:userMongoID})
    if(!car){
        throw new CustomErrors.BadRequestError('You have no cars saved')
    }
    res.status(StatusCodes.OK).json(car)
}

const updateCar = async (req,res) => {
    const car = await Car.findOne({_id:req.params.id})
    if(!car){
        throw new CustomErrors.BadRequestError('You have no cars saved')
    }
    checkPermissions(req.user, car.ownerMongoID)
    const update = await Car.findOneAndUpdate({_id:req.params.id}, req.body, {new:true, runValidators:true})
    res.status(StatusCodes.OK).json(update)
}

const deleteCar = async (req,res) => {
    const car = await Car.findOne({_id:req.params.id})
    if(!car){
        throw new CustomErrors.BadRequestError('This is not a car you own')
    }
    checkPermissions(req.user, car.ownerMongoID)
    if (car.offensesIncurred.length != 0) {
        for(const offense of car.offensesIncurred){
            const check = await Offense.findOne({_id:offense})
            if(check.resolvedOrNot === 'false'){
                throw new CustomErrors.UnauthorizedError('You have outstanding bills. Pay before delete')
            }
        }
    } 
    await car.remove()
    res.status(StatusCodes.OK).json('Deleted car')
}

const getAllOffenses = async (req,res) =>{//might have to also add a check to see if this car belongs to req.user.userMongoID
    const car = await Car.findOne({_id:req.params.id})
    if(!car){
        throw new CustomErrors.BadRequestError('You have no cars saved')
    }
    checkPermissions(req.user, car.ownerMongoID)
    let offenseArr = []
    for(const ids of car.offensesIncurred){
        const toAdd = await Offense.findOne({_id:ids})
        offenseArr.push(toAdd)
    }
    res.status(StatusCodes.OK).json({offenses: offenseArr})
}

const getSingleOffense = async (req,res) =>{
    const car = await Car.findOne({ownerMongoID:req.user.userMongoID})
    if(!car){
        throw new CustomErrors.BadRequestError('You have no cars saved')
    }
    checkPermissions(req.user, car.ownerMongoID)
    let verified = false
    let offenseID = 0
    for( const offense of car.offensesIncurred){
        if(req.params.id === offense.toString()){
            verified = true
            offenseID = offense.toString()
            break
        }
    }
    if(!verified){
        throw new CustomErrors.UnauthorizedError('Account doesn\'t belong to you')
    }
    const singleOffense = await Offense.findOne({_id:offenseID})
    res.status(StatusCodes.OK).json({offenses: singleOffense})
}

module.exports = {addCar,getAllCars,uploadImageAddCar, updateCar, deleteCar,getCar,getAllOffenses,getSingleOffense}