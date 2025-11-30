const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Obtener todos los usuarios
router.get('/all', userController.getAllUsers);

module.exports = router;