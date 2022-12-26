const Offense = require('../models/Offense')
const Car = require('../models/Car')
const Police = require('../models/Police')
const CustomErrors = require('../errors')
const { StatusCodes } = require('http-status-codes')
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { checkPermissions } = require('../utils')

const getImages = async (req, res) => {
  const { carPlate } = req.body
  const car = await Car.findOne({ carPlate: carPlate })
  if (!car) {
    throw new CustomErrors.NotFoundError(`Car plate ${carPlate} not found in database. Issue paper ticket.`)
  }
  res.status(StatusCodes.OK).json(car.imagesOfThisCar)
}

const uploadImage = async (req, res) => {
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: 'offenses',
    }
  );
  //console.log(req.files.image.tempFilePath);
  fs.unlinkSync(req.files.image.tempFilePath);
  return res.status(StatusCodes.OK).json(result.secure_url);
};

const createOffense = async (req, res) => {
  const { offenseType, carPlate, imageEvidence, notes } = req.body
  const linkToCar = await Car.findOne({ carPlate: carPlate })
  if (!linkToCar) {
    throw new CustomErrors.NotFoundError(`Car plate ${carPlate} not found in database. Issue paper ticket.`)
  }
  const police = await Police.findOne({ _id: req.police.policeMongoID })
  const offense = await Offense.create({
    policeThatIssuedOffenseID: req.police.policeMongoID,
    imageEvidence: imageEvidence,
    offenseType: offenseType,
    policeThatIssuedOffenseBadgenumber: police.badgenumber,
    carPlate: carPlate,
    resolvedOrNot: false,
    resolvedDateTime: null,
    notes: notes
  })
  linkToCar.offensesIncurred.push(offense._id)
  await linkToCar.save()
  police.ticketingHistory.push(offense._id)
  await police.save()
  res.status(StatusCodes.CREATED).json({ receipt: offense })
}

const updateOffense = async (req, res) => {
  const { id } = req.params
  const update = await Offense.findOneAndUpdate({ _id: id }, req.body, { new: true, runValidators: true })
  if (!update) {
    throw new CustomErrors.BadRequestError(`Wasn't able to perform this update. Perhaps access mongo and update there`)
  }
  res.status(StatusCodes.OK).json({ receipt: update })
}

module.exports = { getImages, createOffense, uploadImage, updateOffense }