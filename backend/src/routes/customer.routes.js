const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

// Crear nuevo cliente (checkout)
router.post('/', customerController.createCustomer);

// Login de cliente
router.post('/login', customerController.loginCustomer);

// Obtener todos los clientes (debe ir antes de /:customerNumber)
router.get('/all', customerController.getAllCustomers);

// Obtener cliente por número
router.get('/:customerNumber', customerController.getCustomerByNumber);

// Actualizar cliente por ID
router.put('/:id', customerController.updateCustomer);

// Eliminar cliente por ID
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
