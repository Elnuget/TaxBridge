const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Obtener todos los usuarios
router.get('/all', userController.getAllUsers);

// Crear nuevo usuario
router.post('/', userController.createUser);

// Obtener usuario por ID
router.get('/:id', userController.getUserById);

// Actualizar usuario por ID
router.put('/:id', userController.updateUser);

module.exports = router;