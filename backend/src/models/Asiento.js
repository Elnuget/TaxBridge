const mongoose = require('mongoose');

const asientoLineaSchema = new mongoose.Schema({
  cuenta: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  debe: {
    type: Number,
    required: true,
    min: [0, 'El valor del debe no puede ser negativo']
  },
  haber: {
    type: Number,
    required: true,
    min: [0, 'El valor del haber no puede ser negativo']
  }
}, { _id: false });

const asientoSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerNumber: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  moneda: {
    type: String,
    default: 'USD'
  },
  totalDebe: {
    type: Number,
    required: true,
    min: [0, 'El total del debe no puede ser negativo']
  },
  totalHaber: {
    type: Number,
    required: true,
    min: [0, 'El total del haber no puede ser negativo']
  },
  hashResumen: {
    type: String,
    required: true
  },
  lineas: {
    type: [asientoLineaSchema],
    validate: {
      validator: (lineas) => Array.isArray(lineas) && lineas.length > 0,
      message: 'El asiento debe tener al menos una línea contable'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Asiento', asientoSchema);
