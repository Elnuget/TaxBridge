const express = require('express');
const router = express.Router();
const asientosController = require('../controllers/asientos.controller');

router.post('/simulate', asientosController.simulateForCustomer);
router.get('/customer/:customerNumber', asientosController.getAsientosByCustomer);
router.get('/', asientosController.listAll);
router.get('/:id', asientosController.getAsientoById);

module.exports = router;
