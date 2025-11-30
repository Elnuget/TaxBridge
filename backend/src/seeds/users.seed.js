const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
require('dotenv').config();

// Datos de semilla (usar TLDs válidos para pasar la validación)
const ADMIN_EMAIL = 'admin@taxbridge.com';
const CUSTOMER_EMAIL = 'customer@taxbridge.com';

// Limpiar usuarios de prueba
async function clearUsers() {
  try {
    const userResult = await User.deleteMany({ email: { $in: [ADMIN_EMAIL] } });
    const custResult = await Customer.deleteMany({ email: CUSTOMER_EMAIL });
    console.log(`✅ Eliminados usuarios: ${userResult.deletedCount}, clientes: ${custResult.deletedCount}`);
  } catch (error) {
    console.error('❌ Error al limpiar usuarios:', error);
    throw error;
  }
}

// Insertar usuario admin y un customer de prueba
async function seedUsers() {
  try {
    // Admin
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = new User({
        nombre: 'Admin TaxBridge',
        email: ADMIN_EMAIL,
        password: 'Admin123!',
        rol: 'admin',
        activo: true
      });
      await admin.save();
      console.log('✅ Usuario admin creado:', ADMIN_EMAIL);
    } else {
      console.log('ℹ️ Usuario admin ya existe:', ADMIN_EMAIL);
    }

    // Customer
    let customer = await Customer.findOne({ email: CUSTOMER_EMAIL });
    if (!customer) {
      const customerNumber = await Customer.generateCustomerNumber();
      const temporaryPassword = 'Customer1!';

      customer = new Customer({
        customerNumber,
        fullName: 'Cliente Semilla',
        email: CUSTOMER_EMAIL,
        password: temporaryPassword,
        phone: '0999999999',
        identification: '9999999999',
        purchasedProducts: [],
        totalPurchases: 0,
        paymentMethod: 'card',
        isTemporaryPassword: true
      });

      await customer.save();
      console.log('✅ Cliente semilla creado:', CUSTOMER_EMAIL, 'con contraseña temporal:', temporaryPassword);
    } else {
      console.log('ℹ️ Cliente semilla ya existe:', CUSTOMER_EMAIL);
    }

    return { admin, customer };
  } catch (error) {
    console.error('❌ Error al crear semillas de usuarios:', error);
    throw error;
  }
}

// Permite ejecutar esta semilla directamente
async function runSeed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taxbridge');
    console.log('📊 Conectado a MongoDB (users.seed)');

    await clearUsers();
    await seedUsers();

    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error en seed users:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = { clearUsers, seedUsers, runSeed };
