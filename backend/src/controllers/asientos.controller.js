const crypto = require('crypto');
const Asiento = require('../models/Asiento');
const Customer = require('../models/Customer');

const randomInRange = (min, max) => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

const crearLineasBasicas = (base, iva, total) => ([
  {
    cuenta: '110101',
    descripcion: 'Caja / Bancos',
    debe: total,
    haber: 0
  },
  {
    cuenta: '210101',
    descripcion: 'IVA por pagar',
    debe: 0,
    haber: iva
  },
  {
    cuenta: '410101',
    descripcion: 'Ventas netas',
    debe: 0,
    haber: base
  }
]);

const crearHashResumen = (lineas) => {
  const raw = lineas.map(linea => `${linea.cuenta}-${linea.debe}-${linea.haber}`).join('|');
  return crypto.createHash('sha1').update(raw).digest('hex').toUpperCase();
};

exports.simulateForCustomer = async (req, res) => {
  try {
    const { customerNumber } = req.body;

    if (!customerNumber) {
      return res.status(400).json({
        success: false,
        message: 'El número de cliente es requerido'
      });
    }

    const customer = await Customer.findOne({ customerNumber });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const base = randomInRange(120, 1500);
    const iva = Math.round(base * 0.15 * 100) / 100;
    const total = Math.round((base + iva) * 100) / 100;

    const lineas = crearLineasBasicas(base, iva, total);

    const asiento = await Asiento.create({
      customer: customer._id,
      customerNumber: customer.customerNumber,
      customerName: customer.fullName,
      fecha: new Date(),
      moneda: 'USD',
      totalDebe: total,
      totalHaber: total,
      lineas,
      hashResumen: crearHashResumen(lineas)
    });

    res.status(201).json({
      success: true,
      message: 'Asiento contable simulado correctamente',
      data: asiento
    });
  } catch (error) {
    console.error('Error al simular asiento contable:', error);
    res.status(500).json({
      success: false,
      message: 'Error al simular el asiento contable',
      error: error.message
    });
  }
};

exports.getAsientosByCustomer = async (req, res) => {
  try {
    const { customerNumber } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    if (!customerNumber) {
      return res.status(400).json({
        success: false,
        message: 'El número de cliente es requerido'
      });
    }

    const asientos = await Asiento.find({ customerNumber })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: asientos.length,
      data: asientos
    });
  } catch (error) {
    console.error('Error al obtener asientos por cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los asientos del cliente',
      error: error.message
    });
  }
};

exports.getAsientoById = async (req, res) => {
  try {
    const { id } = req.params;

    const asiento = await Asiento.findById(id);

    if (!asiento) {
      return res.status(404).json({
        success: false,
        message: 'Asiento no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: asiento
    });
  } catch (error) {
    console.error('Error al obtener asiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el asiento contable',
      error: error.message
    });
  }
};

exports.listAll = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

    const asientos = await Asiento.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: asientos.length,
      data: asientos
    });
  } catch (error) {
    console.error('Error al listar asientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar los asientos contables',
      error: error.message
    });
  }
};
