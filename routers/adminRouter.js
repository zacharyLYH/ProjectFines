const express = require('express')
const router = express.Router()
const {
    register,
    login,
    showAllStaff,
    showOneStaff,
    updateStaff,
    showStaffTicketingHistory,
    logout,
    updateUser,
    showOneUser,
    getUserCars,
    getSpecificUserCar,
    getUserOffenses,
    deleteUser
} = require('../controllers/admin')
const {
    authenticateAdmin,
    quickPermissionsCheckAdmin,
} = require('../middleware/authenticationAdminOnly');


router.post('/register', register)
router.post('/login', login)
router.post('/updateUser/:id', authenticateAdmin, quickPermissionsCheckAdmin('admin'), updateUser)
router.get('/showAllStaff', authenticateAdmin, quickPermissionsCheckAdmin('admin'), showAllStaff)
router.get('/showOneUser/:email', authenticateAdmin, quickPermissionsCheckAdmin('admin'), showOneUser)
router.get('/getUserCars/:email', authenticateAdmin, quickPermissionsCheckAdmin('admin'), getUserCars)
router.get('/getSpecificUserCar/:email/:carPlate', authenticateAdmin, quickPermissionsCheckAdmin('admin'), getSpecificUserCar)
router.get('/getUserOffenses/:email/:type', authenticateAdmin, quickPermissionsCheckAdmin('admin'), getUserOffenses)
router.get('/showOneStaff/:id', authenticateAdmin, quickPermissionsCheckAdmin('admin'), showOneStaff)
router.get('/showStaffTicketingHistory/:id', authenticateAdmin, quickPermissionsCheckAdmin('admin'), showStaffTicketingHistory)
router.patch('/updateStaff/:id', authenticateAdmin, quickPermissionsCheckAdmin('admin'), updateStaff)
router.delete('/deleteUser/:email', authenticateAdmin, quickPermissionsCheckAdmin('admin'), deleteUser)
router.delete('/logout', authenticateAdmin, logout)
module.exports = router;