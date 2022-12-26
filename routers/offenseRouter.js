const express = require('express')
const router = express.Router()
const { quickPermissionsCheck, authenticatePolice } = require('../middleware/authenticationPoliceOnly');
const { quickPermissionsCheckAdmin, authenticateAdmin } = require('../middleware/authenticationAdminOnly');
const { createOffense, getImages, uploadImage, updateOffense } = require('../controllers/offense')

router.post('/createOffense', authenticatePolice, quickPermissionsCheck('police'), createOffense)
router.post('/uploadImages', authenticatePolice, quickPermissionsCheck('police'), uploadImage)
router.get('/getImages', authenticatePolice, quickPermissionsCheck('police'), getImages)
router.patch('/updateOffense/:id', authenticateAdmin, quickPermissionsCheckAdmin('admin'), updateOffense)

module.exports = router