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
    const userResult = await User.deleteMany({});
    const custResult = await Customer.deleteMany({});
    console.log(`✅ Eliminados todos los usuarios: ${userResult.deletedCount}, todos los clientes: ${custResult.deletedCount}`);
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

    // Crear ~20 clientes adicionales
    const methods = ['card', 'transfer', 'cash', 'wallet'];
    const extraCustomers = [];
    for (let i = 1; i <= 20; i++) {
      try {
        const email = `cliente${i}@taxbridge.com`;
        const exists = await Customer.findOne({ email });
        if (exists) {
          console.log(`ℹ️ Cliente ya existe, se omite: ${email}`);
          continue;
        }

        const customerNumber = await Customer.generateCustomerNumber();
        const temporaryPassword = Customer.generateTemporaryPassword();
        const phone = `0990000${String(i).padStart(3, '0')}`; // e.g. 0990000001
        const identification = String(1000000000 + i);
        const paymentMethod = methods[i % methods.length];

        const c = new Customer({
          customerNumber,
          fullName: `Cliente Semilla ${i}`,
          email,
          password: temporaryPassword,
          phone,
          identification,
          purchasedProducts: [],
          totalPurchases: 0,
          paymentMethod,
          isTemporaryPassword: true
        });

        await c.save();
        extraCustomers.push(c);
        console.log('➕ Cliente creado:', email, '->', customerNumber);
      } catch (err) {
        console.error('❌ Error creando cliente adicional', i, err.message || err);
      }
    }
    return { admin, customer, extraCustomers };
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
