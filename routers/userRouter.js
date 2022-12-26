const express = require('express')
const router = express.Router()
const {register,login,updateAccount,deleteAccount,logout, showMe, addPaymentProfile, showAllPaymentProfile,stripeController, updatePaymentProfile, deletePaymentProfile} = require('../controllers/userBasic.js')
const { quickPermissionsCheckUser, authenticateUser } = require('../middleware/authenticationUserOnly');

router.post('/register', register)
router.post('/login', login)
router.get('/showMe',authenticateUser, showMe)
router.patch('/updateAccount', authenticateUser, updateAccount)
router.delete('/deleteAccount', authenticateUser, deleteAccount)
router.delete('/logout', authenticateUser, logout)
router.post('/addPaymentProfile',authenticateUser, addPaymentProfile)
router.get('/showAllPaymentProfile',authenticateUser, showAllPaymentProfile)
router.patch('/updatePaymentProfile/:id', authenticateUser, updatePaymentProfile)
router.delete('/deletePaymentProfile/:id', authenticateUser, deletePaymentProfile)
router.post('/stripeController/:pay', authenticateUser, stripeController)
//show payments after testing stripe controller

module.exports = router;

