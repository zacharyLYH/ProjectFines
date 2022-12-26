const {addCar,getAllCars,uploadImageAddCar, updateCar, deleteCar,getCar,getAllOffenses,getSingleOffense} = require('../controllers/car')
const express = require('express')
const router = express.Router()
const { quickPermissionsCheckUser, authenticateUser } = require('../middleware/authenticationUserOnly');
//quickPermissionsCheckUser('user'),
router.post('/addCar', authenticateUser, addCar)
router.get('/getSingleCar/:id', authenticateUser, getCar)
router.get('/getCars', authenticateUser, getAllCars)
router.patch('/updateCar/:id', authenticateUser, updateCar)
router.delete('/deleteCar/:id', authenticateUser, deleteCar)
router.get('/getOffenses/:id', authenticateUser, getAllOffenses)
router.get('/getSingleOffense/:id',authenticateUser,getSingleOffense)
router.post('/uploadImageAddCar',authenticateUser,uploadImageAddCar)

module.exports = router