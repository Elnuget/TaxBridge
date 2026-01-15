const mongoose = require('mongoose');
const crypto = require('crypto');

// Algoritmo de encriptación para credenciales sensibles
const ENCRYPTION_KEY = process.env.SRI_ENCRYPTION_KEY || 'taxbridge-sri-secret-key-32ch'; // 32 caracteres
const IV_LENGTH = 16;

/**
 * Función para encriptar datos sensibles
 */
function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Función para desencriptar datos sensibles
 */
function decrypt(text) {
  if (!text) return null;
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Error al desencriptar:', error);
    return null;
  }
}

/**
 * Schema de registro de acceso (para auditoría del grafo)
 */
const accessLogSchema = new mongoose.Schema({
  accessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessedByName: {
    type: String,
    required: true
  },
  accessType: {
    type: String,
    enum: ['view', 'edit', 'create', 'delete', 'export'],
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  accessedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

/**
 * Schema de delegación de acceso (arista del grafo)
 * Permite que un contador delegue temporalmente el acceso a otro usuario
 */
const delegationSchema = new mongoose.Schema({
  delegatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  delegatedToName: {
    type: String,
    required: true
  },
  delegatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  delegatedByName: {
    type: String,
    required: true
  },
  permissions: {
    type: [String],
    enum: ['view', 'edit'],
    default: ['view']
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

/**
 * Schema principal de Credenciales SRI
 * 
 * ESTRUCTURA DEL GRAFO:
 * - Nodo: SRICredential (las credenciales del cliente)
 * - Aristas hacia Customer: relación 1:1 (cliente dueño)
 * - Aristas hacia User (contador): relación de gestión
 * - Aristas hacia delegaciones: múltiples usuarios con acceso temporal
 */
const sriCredentialSchema = new mongoose.Schema({
  // === NODO PRINCIPAL: Identificación ===
  credentialId: {
    type: String,
    required: true,
    unique: true
  },

  // === ARISTA: Relación con el Cliente (nodo Customer) ===
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerNumber: {
    type: String,
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true
  },

  // === ARISTA: Relación con el Contador (nodo User con rol='contador') ===
  assignedContador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedContadorName: {
    type: String
  },

  // === DATOS DE CREDENCIALES SRI (encriptados) ===
  sriUsername: {
    type: String,
    required: true,
    trim: true,
    set: encrypt,
    get: decrypt
  },
  sriPassword: {
    type: String,
    required: true,
    set: encrypt,
    get: decrypt
  },
  
  // RUC del contribuyente
  ruc: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{13}$/, 'El RUC debe tener 13 dígitos']
  },

  // Tipo de contribuyente
  tipoContribuyente: {
    type: String,
    enum: ['persona_natural', 'sociedad', 'rise'],
    required: true
  },

  // Razón social (si aplica)
  razonSocial: {
    type: String,
    trim: true
  },

  // === ARISTAS: Delegaciones de acceso (nodos User adicionales) ===
  delegations: [delegationSchema],

  // === METADATOS DEL GRAFO ===
  // Profundidad en el grafo (distancia desde el admin)
  graphDepth: {
    type: Number,
    default: 2 // Admin(0) -> Contador(1) -> Credencial(2)
  },

  // Nodos padres en el grafo (para navegación bidireccional)
  parentNodes: [{
    nodeType: {
      type: String,
      enum: ['admin', 'contador', 'customer']
    },
    nodeId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'parentNodes.nodeType'
    }
  }],

  // === REGISTRO DE ACCESOS (Auditoría del grafo) ===
  accessLog: [accessLogSchema],
  lastAccessedAt: {
    type: Date
  },
  lastAccessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // === ESTADO ===
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'revoked'],
    default: 'active'
  },

  // Fecha de expiración de las credenciales
  expiresAt: {
    type: Date
  },

  // Notas adicionales (encriptadas)
  notes: {
    type: String,
    set: encrypt,
    get: decrypt
  }

}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// === ÍNDICES PARA BÚSQUEDA EFICIENTE EN EL GRAFO ===
sriCredentialSchema.index({ customer: 1, assignedContador: 1 });
sriCredentialSchema.index({ ruc: 1 });
sriCredentialSchema.index({ 'delegations.delegatedTo': 1 });
sriCredentialSchema.index({ status: 1 });

// === MÉTODOS ESTÁTICOS ===

/**
 * Genera un ID único para las credenciales
 */
sriCredentialSchema.statics.generateCredentialId = async function() {
  const count = await this.countDocuments();
  const nextNumber = count + 1;
  return `SRI-${String(nextNumber).padStart(6, '0')}`;
};

/**
 * FUNCIÓN DE GRAFO: Obtener todas las credenciales accesibles por un usuario
 * Implementa la traversía del grafo según los permisos del usuario
 * 
 * @param {ObjectId} userId - ID del usuario
 * @param {String} userRole - Rol del usuario (admin, contador, cliente)
 * @returns {Array} Credenciales accesibles
 */
sriCredentialSchema.statics.getAccessibleCredentials = async function(userId, userRole) {
  const query = { status: 'active' };
  
  switch (userRole) {
    case 'admin':
      // Admin puede ver todas las credenciales (raíz del grafo)
      break;
    
    case 'contador':
      // Contador ve las credenciales asignadas + delegadas
      query.$or = [
        { assignedContador: userId },
        { 
          'delegations.delegatedTo': userId,
          'delegations.isActive': true,
          'delegations.expiresAt': { $gt: new Date() }
        }
      ];
      break;
    
    case 'cliente':
      // Cliente solo ve sus propias credenciales
      // Necesitamos buscar el customer asociado al usuario
      const Customer = mongoose.model('Customer');
      const customer = await Customer.findOne({ /* buscar por email o relación */ });
      if (customer) {
        query.customer = customer._id;
      } else {
        return []; // No tiene credenciales
      }
      break;
    
    default:
      return []; // Rol no reconocido
  }
  
  return this.find(query)
    .populate('customer', 'customerNumber fullName email')
    .populate('assignedContador', 'nombre email')
    .select('-sriPassword'); // No devolver contraseña en listados
};

/**
 * FUNCIÓN DE GRAFO: Verificar si un usuario tiene acceso a una credencial específica
 * Traversía del grafo para validar permisos
 * 
 * @param {ObjectId} credentialId - ID de la credencial
 * @param {ObjectId} userId - ID del usuario
 * @param {String} userRole - Rol del usuario
 * @param {String} accessType - Tipo de acceso requerido (view, edit)
 * @returns {Boolean} true si tiene acceso
 */
sriCredentialSchema.statics.hasAccess = async function(credentialId, userId, userRole, accessType = 'view') {
  const credential = await this.findById(credentialId);
  if (!credential) return false;
  
  // Admin siempre tiene acceso
  if (userRole === 'admin') return true;
  
  // Contador asignado tiene acceso completo
  if (userRole === 'contador' && credential.assignedContador?.toString() === userId.toString()) {
    return true;
  }
  
  // Verificar delegaciones activas
  const delegation = credential.delegations.find(d => 
    d.delegatedTo.toString() === userId.toString() &&
    d.isActive &&
    d.expiresAt > new Date() &&
    d.permissions.includes(accessType)
  );
  
  return !!delegation;
};

/**
 * FUNCIÓN DE GRAFO: Obtener el árbol de relaciones de una credencial
 * Retorna la estructura jerárquica para visualización
 */
sriCredentialSchema.statics.getCredentialGraph = async function(credentialId) {
  const credential = await this.findById(credentialId)
    .populate('customer', 'customerNumber fullName email identification')
    .populate('assignedContador', 'nombre email rol')
    .populate('delegations.delegatedTo', 'nombre email rol')
    .populate('delegations.delegatedBy', 'nombre email rol');
  
  if (!credential) return null;
  
  // Construir estructura del grafo
  return {
    // Nodo raíz (la credencial)
    node: {
      id: credential._id,
      credentialId: credential.credentialId,
      type: 'credential',
      ruc: credential.ruc,
      status: credential.status
    },
    // Aristas y nodos conectados
    edges: {
      // Relación con el cliente (propietario)
      customer: {
        relationship: 'BELONGS_TO',
        node: credential.customer ? {
          id: credential.customer._id,
          type: 'customer',
          customerNumber: credential.customer.customerNumber,
          name: credential.customer.fullName,
          email: credential.customer.email
        } : null
      },
      // Relación con el contador (gestor)
      contador: {
        relationship: 'MANAGED_BY',
        node: credential.assignedContador ? {
          id: credential.assignedContador._id,
          type: 'user',
          role: 'contador',
          name: credential.assignedContador.nombre,
          email: credential.assignedContador.email
        } : null
      },
      // Delegaciones (accesos temporales)
      delegations: credential.delegations
        .filter(d => d.isActive && d.expiresAt > new Date())
        .map(d => ({
          relationship: 'DELEGATED_TO',
          node: {
            id: d.delegatedTo._id || d.delegatedTo,
            type: 'user',
            name: d.delegatedToName,
            permissions: d.permissions,
            expiresAt: d.expiresAt
          },
          delegatedBy: {
            id: d.delegatedBy._id || d.delegatedBy,
            name: d.delegatedByName
          }
        }))
    },
    // Metadatos del grafo
    metadata: {
      depth: credential.graphDepth,
      lastAccessed: credential.lastAccessedAt,
      accessCount: credential.accessLog.length
    }
  };
};

// === MÉTODOS DE INSTANCIA ===

/**
 * Registrar un acceso en el log de auditoría
 */
sriCredentialSchema.methods.logAccess = async function(userId, userName, accessType, ipAddress, userAgent) {
  this.accessLog.push({
    accessedBy: userId,
    accessedByName: userName,
    accessType,
    ipAddress,
    userAgent,
    accessedAt: new Date()
  });
  
  this.lastAccessedAt = new Date();
  this.lastAccessedBy = userId;
  
  // Mantener solo los últimos 100 registros de acceso
  if (this.accessLog.length > 100) {
    this.accessLog = this.accessLog.slice(-100);
  }
  
  await this.save();
};

/**
 * Agregar una delegación de acceso
 */
sriCredentialSchema.methods.addDelegation = async function(delegatedToId, delegatedToName, delegatedById, delegatedByName, permissions, expiresAt) {
  // Verificar que no exista ya una delegación activa para este usuario
  const existingDelegation = this.delegations.find(d => 
    d.delegatedTo.toString() === delegatedToId.toString() && d.isActive
  );
  
  if (existingDelegation) {
    // Actualizar la existente
    existingDelegation.permissions = permissions;
    existingDelegation.expiresAt = expiresAt;
  } else {
    // Crear nueva
    this.delegations.push({
      delegatedTo: delegatedToId,
      delegatedToName,
      delegatedBy: delegatedById,
      delegatedByName,
      permissions,
      expiresAt,
      isActive: true
    });
  }
  
  await this.save();
};

/**
 * Revocar una delegación
 */
sriCredentialSchema.methods.revokeDelegation = async function(delegatedToId) {
  const delegation = this.delegations.find(d => 
    d.delegatedTo.toString() === delegatedToId.toString() && d.isActive
  );
  
  if (delegation) {
    delegation.isActive = false;
    await this.save();
    return true;
  }
  
  return false;
};

/**
 * Obtener datos seguros para respuesta (sin información sensible)
 */
sriCredentialSchema.methods.toSafeJSON = function() {
  const obj = this.toObject({ getters: true });
  delete obj.sriPassword;
  delete obj.accessLog;
  return obj;
};

module.exports = mongoose.model('SRICredential', sriCredentialSchema);
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
