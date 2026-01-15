const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso denegado',
      message: 'Token no proporcionado' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_change_in_production');
    
    // Mapear id a _id para compatibilidad con el resto del código
    req.user = {
      _id: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
      customerNumber: decoded.customerNumber // Para clientes
    };
    
    console.log('✅ Token verificado:', { email: req.user.email, rol: req.user.rol });
    next();
  } catch (error) {
    console.error('❌ Error al verificar token:', error.message);
    res.status(401).json({ 
      error: 'Token inválido',
      message: 'Token expirado o malformado' 
    });
  }
};

module.exports = authMiddleware;