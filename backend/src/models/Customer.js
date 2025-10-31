const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const purchasedProductSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  }
});

const customerSchema = new mongoose.Schema({
  customerNumber: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  isTemporaryPassword: {
    type: Boolean,
    default: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  identification: {
    type: String,
    required: true,
    trim: true
  },
  purchasedProducts: [purchasedProductSchema],
  totalPurchases: {
    type: Number,
    default: 0
  },
  lastPurchaseDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'transfer', 'cash', 'wallet'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Hash password antes de guardar
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
customerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generar número de cliente único
customerSchema.statics.generateCustomerNumber = async function() {
  const count = await this.countDocuments();
  const customerNumber = `TB-${String(count + 1).padStart(6, '0')}`;
  return customerNumber;
};

// Generar contraseña temporal
customerSchema.statics.generateTemporaryPassword = function() {
  // Genera una contraseña temporal de 8 caracteres
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin caracteres confusos
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Método para agregar productos
customerSchema.methods.addProducts = function(products) {
  this.purchasedProducts.push(...products);
  this.totalPurchases = this.purchasedProducts.reduce((sum, product) => sum + product.totalPrice, 0);
  this.lastPurchaseDate = new Date();
  return this.save();
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
