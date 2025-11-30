const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Obtener todos los usuarios
router.get('/all', userController.getAllUsers);

// Crear nuevo usuario
router.post('/', userController.createUser);

module.exports = router;