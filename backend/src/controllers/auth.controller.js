const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

exports.login = exports.login = exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    // Buscar en colección de usuarios (admins/contadores)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (user) {
      const valid = await user.comparePassword(password);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }

      if (!user.activo) {
        return res.status(403).json({
          success: false,
          message: 'El usuario está inactivo, contacte al administrador'
        });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        type: 'user',
        data: user.toPublicJSON(),
        token
      });
    }

    // Buscar en colección de clientes
    const customer = await Customer.findOne({ email: email.toLowerCase() }).select('+password');
    if (customer) {
      const valid = await customer.comparePassword(password);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }

      if (customer.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'La cuenta de cliente está inactiva, contacte al administrador'
        });
      }

      const token = jwt.sign(
        { id: customer._id, email: customer.email, rol: 'cliente', customerNumber: customer.customerNumber },
        process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        type: 'customer',
        data: {
          customerNumber: customer.customerNumber,
          fullName: customer.fullName,
          email: customer.email,
          isTemporaryPassword: customer.isTemporaryPassword
        },
        token
      });
    }

    return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
  } catch (error) {
    console.error('Error en auth.login:', error);
    res.status(500).json({ success: false, message: 'Error interno', error: error.message });
  }
};;;
