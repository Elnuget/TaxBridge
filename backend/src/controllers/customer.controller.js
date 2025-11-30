const Customer = require('../models/Customer');

// Crear nuevo cliente con compra
// Crear nuevo cliente
exports.createCustomer = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      identification,
      products,
      paymentMethod,
      password,
      status
    } = req.body;

    // Validar datos requeridos básicos
    if (!fullName || !email || !phone || !identification || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email, teléfono, identificación y método de pago son requeridos'
      });
    }

    // Verificar si el email ya existe
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta con este correo electrónico'
      });
    }

    // Verificar si la identificación ya existe (si es que debe ser única)
    // const existingId = await Customer.findOne({ identification });
    // if (existingId) { ... }

    // Generar número de cliente único
    const customerNumber = await Customer.generateCustomerNumber();

    // Manejar contraseña
    let finalPassword = password;
    let isTemporary = false;

    if (!finalPassword) {
      finalPassword = Customer.generateTemporaryPassword();
      isTemporary = true;
    }

    // Procesar productos si existen
    let purchasedProducts = [];
    let totalPurchases = 0;
    let lastPurchaseDate = null;

    if (products && Array.isArray(products) && products.length > 0) {
      purchasedProducts = products.map(product => ({
        productId: product.id,
        productName: product.name,
        quantity: product.quantity,
        unitPrice: product.price,
        totalPrice: product.price * product.quantity,
        category: product.category
      }));
      totalPurchases = purchasedProducts.reduce((sum, product) => sum + product.totalPrice, 0);
      lastPurchaseDate = new Date();
    }

    // Crear cliente
    const customer = new Customer({
      customerNumber,
      fullName,
      email,
      password: finalPassword,
      phone,
      identification,
      purchasedProducts,
      totalPurchases,
      paymentMethod,
      lastPurchaseDate: lastPurchaseDate || undefined, // Si no hay compra, no poner fecha? O poner fecha de registro? El modelo tiene default Date.now
      isTemporaryPassword: isTemporary,
      status: status || 'active'
    });

    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: {
        customerNumber: customer.customerNumber,
        fullName: customer.fullName,
        email: customer.email,
        temporaryPassword: isTemporary ? finalPassword : null, // Solo devolver si fue generada
        totalPurchases: customer.totalPurchases,
        productsCount: customer.purchasedProducts.length,
        isTemporaryPassword: isTemporary
      }
    });

  } catch (error) {
    console.error('Error al crear cliente:', error);

    // Manejo de errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        error: error.message
      });
    }

    // Error de duplicado (si se pasó el check manual)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'El email o número de cliente ya existe',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error.message
    });
  }
};

// Obtener cliente por número
exports.getCustomerByNumber = async (req, res) => {
  try {
    const { customerNumber } = req.params;

    const customer = await Customer.findOne({ customerNumber });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del cliente',
      error: error.message
    });
  }
};

// Obtener todos los clientes
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });

  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: error.message
    });
  }
};

// Login de cliente
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar cliente por email
    const customer = await Customer.findOne({ email: email.toLowerCase() });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await customer.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Login exitoso
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        customerNumber: customer.customerNumber,
        fullName: customer.fullName,
        email: customer.email,
        isTemporaryPassword: customer.isTemporaryPassword
      }
    });

  } catch (error) {
    console.error('Error al hacer login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el login',
      error: error.message
    });
  }
};
