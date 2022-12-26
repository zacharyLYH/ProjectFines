const { login, register, loginHistory, showMe, updatePolicePassword, logout, showMyTicketingHistory} = require('../controllers/police')
const express = require('express')
const router = express.Router()
const { authenticatePolice,quickPermissionsCheck } = require('../middleware/authenticationPoliceOnly');

router.post('/register', register)
router.post('/login', login)
router.get('/loginHistory', authenticatePolice, quickPermissionsCheck('police'), loginHistory)
router.get('/showMe', authenticatePolice, quickPermissionsCheck('police'), showMe)
router.patch('/updateStaffPassword', authenticatePolice, quickPermissionsCheck('police'), updatePolicePassword)
router.delete('/logout', authenticatePolice, logout)
router.get('/showMyTicketingHistory', authenticatePolice, quickPermissionsCheck('police'), showMyTicketingHistory)


module.exports = router;