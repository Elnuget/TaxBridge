const Customer = require('../models/Customer');

// Crear nuevo cliente con compra
exports.createCustomer = async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      phone, 
      identification, 
      products,
      paymentMethod
    } = req.body;

    // Validar datos requeridos
    if (!fullName || !email || !phone || !identification || !products || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
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

    // Generar número de cliente único
    const customerNumber = await Customer.generateCustomerNumber();

    // Generar contraseña temporal
    const temporaryPassword = Customer.generateTemporaryPassword();

    // Calcular totales
    const purchasedProducts = products.map(product => ({
      productId: product.id,
      productName: product.name,
      quantity: product.quantity,
      unitPrice: product.price,
      totalPrice: product.price * product.quantity,
      category: product.category
    }));

    const totalPurchases = purchasedProducts.reduce((sum, product) => sum + product.totalPrice, 0);

    // Crear cliente
    const customer = new Customer({
      customerNumber,
      fullName,
      email,
      password: temporaryPassword, // Se hasheará automáticamente
      phone,
      identification,
      purchasedProducts,
      totalPurchases,
      paymentMethod,
      lastPurchaseDate: new Date(),
      isTemporaryPassword: true
    });

    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: {
        customerNumber: customer.customerNumber,
        fullName: customer.fullName,
        email: customer.email,
        temporaryPassword: temporaryPassword, // Contraseña temporal en texto plano
        totalPurchases: customer.totalPurchases,
        productsCount: customer.purchasedProducts.length,
        isTemporaryPassword: true
      }
    });

  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la compra',
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
