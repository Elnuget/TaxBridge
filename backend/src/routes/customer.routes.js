const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

// Crear nuevo cliente (checkout)
router.post('/', customerController.createCustomer);

// Obtener cliente por número
router.get('/:customerNumber', customerController.getCustomerByNumber);

// Obtener todos los clientes
router.get('/', customerController.getAllCustomers);

module.exports = router;
