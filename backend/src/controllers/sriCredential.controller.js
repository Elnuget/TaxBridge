const SRICredential = require('../models/SRICredential');
const Customer = require('../models/Customer');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * ===========================================
 * CONTROLADOR DE CREDENCIALES SRI CON GRAFOS
 * ===========================================
 * 
 * Este controlador implementa las operaciones CRUD sobre las credenciales
 * del SRI, utilizando la estructura de grafos para:
 * 
 * 1. Control de acceso jerárquico (Admin → Contador → Cliente)
 * 2. Delegación de permisos temporales
 * 3. Auditoría completa de accesos
 * 4. Visualización del grafo de relaciones
 */

// =====================
// CREAR CREDENCIAL SRI
// =====================
exports.createSRICredential = async (req, res) => {
  try {
    const {
      customerNumber,
      sriUsername,
      sriPassword,
      ruc,
      tipoContribuyente,
      razonSocial,
      assignedContadorId,
      notes,
      expiresAt
    } = req.body;

    // Validar campos requeridos
    if (!customerNumber || !sriUsername || !sriPassword || !ruc || !tipoContribuyente) {
      return res.status(400).json({
        success: false,
        message: 'customerNumber, sriUsername, sriPassword, ruc y tipoContribuyente son requeridos'
      });
    }

    // Buscar el cliente por su número
    const customer = await Customer.findOne({ customerNumber });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Verificar si ya existe una credencial para este RUC
    const existingCredential = await SRICredential.findOne({ ruc });
    if (existingCredential) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una credencial registrada para este RUC'
      });
    }

    // Buscar el contador asignado (si se especifica)
    let contador = null;
    if (assignedContadorId) {
      contador = await User.findOne({ _id: assignedContadorId, rol: 'contador' });
      if (!contador) {
        return res.status(404).json({
          success: false,
          message: 'Contador no encontrado o el usuario no tiene rol de contador'
        });
      }
    }

    // Generar ID único
    const credentialId = await SRICredential.generateCredentialId();

    // Construir nodos padres para el grafo
    const parentNodes = [
      { nodeType: 'customer', nodeId: customer._id }
    ];
    if (contador) {
      parentNodes.push({ nodeType: 'contador', nodeId: contador._id });
    }

    // Crear la credencial
    const credential = new SRICredential({
      credentialId,
      customer: customer._id,
      customerNumber: customer.customerNumber,
      customerName: customer.fullName,
      assignedContador: contador?._id,
      assignedContadorName: contador?.nombre,
      sriUsername,
      sriPassword,
      ruc,
      tipoContribuyente,
      razonSocial,
      notes,
      expiresAt,
      parentNodes,
      graphDepth: contador ? 2 : 3 // Si tiene contador: Admin(0)->Contador(1)->Cred(2), sino: Admin(0)->Cliente(1)->Cred(2)->? 
    });

    await credential.save();

    // Registrar el acceso de creación
    if (req.user) {
      await credential.logAccess(
        req.user._id,
        req.user.nombre,
        'create',
        req.ip,
        req.get('User-Agent')
      );
    }

    res.status(201).json({
      success: true,
      message: 'Credencial SRI creada exitosamente',
      data: {
        credentialId: credential.credentialId,
        customerNumber: credential.customerNumber,
        customerName: credential.customerName,
        ruc: credential.ruc,
        tipoContribuyente: credential.tipoContribuyente,
        assignedContador: credential.assignedContadorName,
        status: credential.status
      }
    });

  } catch (error) {
    console.error('Error al crear credencial SRI:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear credencial SRI',
      error: error.message
    });
  }
};

// ========================================
// OBTENER CREDENCIALES (CON FILTRO DE GRAFO)
// ========================================
exports.getAllCredentials = async (req, res) => {
  try {
    // El usuario y su rol vienen del middleware de autenticación
    const userId = req.user?._id;
    const userRole = req.user?.rol || 'cliente';
    const customerNumber = req.user?.customerNumber; // Para clientes

    console.log('📋 Obteniendo credenciales para:', { 
      userId, 
      userRole, 
      customerNumber 
    });

    // Usar la función de grafo para obtener credenciales accesibles
    let credentials;
    
    if (userRole === 'admin' || userRole === 'contador') {
      // Admin y contadores ven TODAS las credenciales
      credentials = await SRICredential.find()
        .populate('customer', 'customerNumber fullName email')
        .populate('assignedContador', 'nombre email')
        .select('-sriPassword -accessLog');
    } else {
      // Clientes solo ven sus propias credenciales usando customerNumber
      credentials = await SRICredential.getAccessibleCredentials(
        userId, 
        userRole, 
        customerNumber
      );
    }

    console.log(`✅ Credenciales encontradas: ${credentials.length}`);

    res.json({
      success: true,
      count: credentials.length,
      data: credentials.map(c => c.toSafeJSON ? c.toSafeJSON() : c)
    });

  } catch (error) {
    console.error('Error al obtener credenciales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener credenciales',
      error: error.message
    });
  }
};

// ==================================
// OBTENER CREDENCIAL POR ID (CON GRAFO)
// ==================================
exports.getCredentialById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.rol || 'cliente';

    // Verificar acceso usando el grafo
    const hasAccess = await SRICredential.hasAccess(id, userId, userRole, 'view');
    if (!hasAccess && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para ver esta credencial'
      });
    }

    const credential = await SRICredential.findById(id)
      .populate('customer', 'customerNumber fullName email phone identification')
      .populate('assignedContador', 'nombre email telefono')
      .populate('delegations.delegatedTo', 'nombre email')
      .populate('delegations.delegatedBy', 'nombre email');

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credencial no encontrada'
      });
    }

    // Registrar acceso
    if (req.user) {
      await credential.logAccess(
        req.user._id,
        req.user.nombre,
        'view',
        req.ip,
        req.get('User-Agent')
      );
    }

    res.json({
      success: true,
      data: credential.toSafeJSON()
    });

  } catch (error) {
    console.error('Error al obtener credencial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener credencial',
      error: error.message
    });
  }
};

// ===============================
// OBTENER CREDENCIAL POR CUSTOMER
// ===============================
exports.getCredentialByCustomer = async (req, res) => {
  try {
    const { customerNumber } = req.params;

    const credential = await SRICredential.findOne({ customerNumber })
      .populate('customer', 'customerNumber fullName email')
      .populate('assignedContador', 'nombre email')
      .select('-accessLog');

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró credencial para este cliente'
      });
    }

    // Registrar acceso
    if (req.user) {
      await credential.logAccess(
        req.user._id,
        req.user.nombre,
        'view',
        req.ip,
        req.get('User-Agent')
      );
    }

    res.json({
      success: true,
      data: credential.toSafeJSON()
    });

  } catch (error) {
    console.error('Error al obtener credencial por cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener credencial',
      error: error.message
    });
  }
};

// =========================
// ACTUALIZAR CREDENCIAL SRI
// =========================
exports.updateCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.rol || 'admin'; // Modo desarrollo: asumir admin si no hay usuario

    // TODO: Habilitar autenticación en producción
    // Verificar acceso de edición usando el grafo (deshabilitado temporalmente)
    // const hasAccess = await SRICredential.hasAccess(id, userId, userRole, 'edit');
    // if (!hasAccess && userRole !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'No tiene permisos para editar esta credencial'
    //   });
    // }

    const {
      sriUsername,
      sriPassword,
      tipoContribuyente,
      razonSocial,
      assignedContadorId,
      notes,
      expiresAt,
      status
    } = req.body;

    const credential = await SRICredential.findById(id);
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credencial no encontrada'
      });
    }

    // Actualizar campos
    if (sriUsername) credential.sriUsername = sriUsername;
    if (sriPassword) credential.sriPassword = sriPassword;
    if (tipoContribuyente) credential.tipoContribuyente = tipoContribuyente;
    if (razonSocial !== undefined) credential.razonSocial = razonSocial;
    if (notes !== undefined) credential.notes = notes;
    if (expiresAt) credential.expiresAt = expiresAt;
    if (status) credential.status = status;

    // Actualizar contador asignado si se especifica
    if (assignedContadorId) {
      const contador = await User.findOne({ _id: assignedContadorId, rol: 'contador' });
      if (contador) {
        credential.assignedContador = contador._id;
        credential.assignedContadorName = contador.nombre;
        
        // Actualizar nodos padres del grafo
        const contadorNode = credential.parentNodes.find(n => n.nodeType === 'contador');
        if (contadorNode) {
          contadorNode.nodeId = contador._id;
        } else {
          credential.parentNodes.push({ nodeType: 'contador', nodeId: contador._id });
        }
      }
    }

    await credential.save();

    // Registrar acceso de edición
    if (req.user) {
      await credential.logAccess(
        req.user._id,
        req.user.nombre,
        'edit',
        req.ip,
        req.get('User-Agent')
      );
    } else {
      // Modo desarrollo: registrar sin usuario
      console.log('[DEV] Credencial actualizada sin usuario autenticado');
    }

    res.json({
      success: true,
      message: 'Credencial actualizada exitosamente',
      data: credential.toSafeJSON()
    });

  } catch (error) {
    console.error('Error al actualizar credencial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar credencial',
      error: error.message
    });
  }
};

// ====================
// ELIMINAR CREDENCIAL
// ====================
exports.deleteCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.rol || 'admin'; // Modo desarrollo: asumir admin si no hay usuario

    // TODO: Habilitar verificación en producción
    // Solo admin puede eliminar
    // if (userRole !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Solo los administradores pueden eliminar credenciales'
    //   });
    // }

    const credential = await SRICredential.findByIdAndDelete(id);
    
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credencial no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Credencial eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar credencial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar credencial',
      error: error.message
    });
  }
};

// ================================
// FUNCIONES ESPECÍFICAS DEL GRAFO
// ================================

/**
 * Obtener el grafo visual de una credencial
 * Retorna la estructura de nodos y aristas para visualización
 */
exports.getCredentialGraph = async (req, res) => {
  try {
    const { id } = req.params;
    
    const graph = await SRICredential.getCredentialGraph(id);
    
    if (!graph) {
      return res.status(404).json({
        success: false,
        message: 'Credencial no encontrada'
      });
    }

    res.json({
      success: true,
      data: graph
    });

  } catch (error) {
    console.error('Error al obtener grafo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estructura del grafo',
      error: error.message
    });
  }
};

/**
 * Obtener el grafo filtrado según el rol del usuario
 * - ADMIN: Ve todo el sistema (Admin → Contadores → Clientes → Credenciales)
 * - CONTADOR: Ve solo sus clientes asignados y sus credenciales
 * - CLIENTE: Ve solo sus propias credenciales y su contador
 */
exports.getFullCredentialsGraph = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.rol;
    
    // Validar que el usuario esté autenticado
    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado. Por favor inicie sesión.'
      });
    }
    
    console.log(`[GRAFO] Usuario: ${userId}, Rol: ${userRole}`);

    let credentials = [];
    let contadores = [];
    let customers = [];

    // ==========================================
    // FILTRADO SEGÚN ROL DEL USUARIO
    // ==========================================

    if (userRole === 'admin') {
      // ADMIN: Ver todo el sistema
      [credentials, contadores, customers] = await Promise.all([
        SRICredential.find({ status: 'active' })
          .populate('customer', 'customerNumber fullName')
          .populate('assignedContador', 'nombre email'),
        User.find({ rol: 'contador', activo: true }).select('nombre email'),
        Customer.find({ status: 'active' }).select('customerNumber fullName')
      ]);

    } else if (userRole === 'contador') {
      // CONTADOR: Solo sus clientes asignados
      credentials = await SRICredential.find({ 
        status: 'active',
        assignedContador: userId 
      })
        .populate('customer', 'customerNumber fullName')
        .populate('assignedContador', 'nombre email');

      // Solo este contador
      contadores = await User.find({ 
        _id: userId, 
        rol: 'contador' 
      }).select('nombre email');

      // Solo clientes con credenciales asignadas a este contador
      const customerIds = [...new Set(credentials.map(c => c.customer?._id).filter(Boolean))];
      customers = await Customer.find({ 
        _id: { $in: customerIds },
        status: 'active' 
      }).select('customerNumber fullName');

    } else if (userRole === 'cliente') {
      // CLIENTE: Solo sus propias credenciales
      // Primero encontrar el Customer asociado a este usuario
      const customer = await Customer.findOne({ email: req.user?.email });
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      credentials = await SRICredential.find({ 
        status: 'active',
        customer: customer._id 
      })
        .populate('customer', 'customerNumber fullName')
        .populate('assignedContador', 'nombre email');

      // Solo el cliente actual
      customers = [customer];

      // Solo el contador asignado a este cliente
      if (credentials.length > 0 && credentials[0].assignedContador) {
        contadores = await User.find({ 
          _id: credentials[0].assignedContador._id,
          rol: 'contador' 
        }).select('nombre email');
      }

    } else {
      return res.status(403).json({
        success: false,
        message: 'Rol de usuario no autorizado'
      });
    }

    // ==========================================
    // CONSTRUCCIÓN DEL GRAFO
    // ==========================================
    const graph = {
      nodes: [],
      edges: [],
      hierarchy: {}
    };

    // Solo mostrar nodo Admin si el usuario ES admin
    if (userRole === 'admin') {
      graph.nodes.push({
        id: 'admin-root',
        type: 'admin',
        label: 'Administración TaxBridge',
        level: 0,
        depth: 0
      });
      graph.hierarchy['admin-root'] = { children: [] };
    }

    // Agregar contadores (nivel 1)
    contadores.forEach(contador => {
      const contadorId = `contador-${contador._id}`;
      graph.nodes.push({
        id: contadorId,
        type: 'contador',
        label: contador.nombre,
        email: contador.email,
        level: userRole === 'admin' ? 1 : 0, // Si no es admin, contador es nivel 0
        depth: userRole === 'admin' ? 1 : 0,
        mongoId: contador._id.toString()
      });
      
      // Solo agregar arista Admin → Contador si es admin
      if (userRole === 'admin') {
        graph.edges.push({
          from: 'admin-root',
          to: contadorId,
          relationship: 'MANAGES',
          label: 'gestiona'
        });
        graph.hierarchy[contadorId] = { children: [], parent: 'admin-root' };
        graph.hierarchy['admin-root'].children.push(contadorId);
      } else {
        graph.hierarchy[contadorId] = { children: [] };
      }
    });

    // Mapear clientes por contador
    const clientesPorContador = {};
    
    credentials.forEach(cred => {
      if (cred.assignedContador) {
        const contadorId = cred.assignedContador._id?.toString() || cred.assignedContador.toString();
        if (!clientesPorContador[contadorId]) {
          clientesPorContador[contadorId] = new Set();
        }
        clientesPorContador[contadorId].add(cred.customer?._id?.toString() || cred.customerNumber);
      }
    });

    // Calcular niveles según el rol
    const nivelCliente = userRole === 'admin' ? 2 : (userRole === 'contador' ? 1 : 0);
    const nivelCredencial = userRole === 'admin' ? 3 : (userRole === 'contador' ? 2 : 1);

    // Agregar clientes (nivel 2 para admin, 1 para contador, 0 para cliente)
    const clientesAgregados = new Set();
    
    Object.entries(clientesPorContador).forEach(([contadorId, clienteIds]) => {
      const contadorNodeId = `contador-${contadorId}`;
      
      // Asegurar que el nodo contador existe en hierarchy
      if (!graph.hierarchy[contadorNodeId]) {
        graph.hierarchy[contadorNodeId] = { children: [] };
      }
      
      clienteIds.forEach(clienteId => {
        if (clientesAgregados.has(clienteId)) return;
        
        const cred = credentials.find(c => 
          (c.customer?._id?.toString() || c.customerNumber) === clienteId
        );
        
        if (!cred) return;
        
        const customerNodeId = `customer-${clienteId}`;
        clientesAgregados.add(clienteId);
        
        graph.nodes.push({
          id: customerNodeId,
          type: 'customer',
          label: cred.customerName,
          customerNumber: cred.customerNumber,
          level: nivelCliente,
          depth: nivelCliente,
          parentContador: contadorNodeId
        });
        
        // Solo agregar arista Contador → Cliente si hay contadores visibles
        if (contadores.length > 0) {
          graph.edges.push({
            from: contadorNodeId,
            to: customerNodeId,
            relationship: 'ASSIGNED_TO',
            label: 'atiende a'
          });
        }

        graph.hierarchy[customerNodeId] = { children: [], parent: contadorNodeId };
        graph.hierarchy[contadorNodeId].children.push(customerNodeId);
      });
    });

    // Agregar credenciales (nivel 3 para admin, 2 para contador, 1 para cliente)
    credentials.forEach(cred => {
      const customerNodeId = `customer-${cred.customer?._id?.toString() || cred.customerNumber}`;
      const credentialNodeId = `credential-${cred._id}`;
      
      graph.nodes.push({
        id: credentialNodeId,
        type: 'credential',
        label: cred.razonSocial || `Credencial ${cred.ruc}`,
        subtitle: cred.ruc,
        credentialId: cred.credentialId,
        status: cred.status,
        tipoContribuyente: cred.tipoContribuyente,
        level: nivelCredencial,
        depth: nivelCredencial,
        parentCustomer: customerNodeId
      });
      
      // Arista: Cliente → Credencial
      graph.edges.push({
        from: customerNodeId,
        to: credentialNodeId,
        relationship: 'OWNS',
        label: 'posee'
      });

      // Asegurar que el nodo customer existe en hierarchy antes de agregar children
      if (!graph.hierarchy[customerNodeId]) {
        graph.hierarchy[customerNodeId] = { children: [] };
      }
      
      graph.hierarchy[credentialNodeId] = { parent: customerNodeId };
      graph.hierarchy[customerNodeId].children.push(credentialNodeId);
      
      // Aristas de delegaciones
      cred.delegations?.filter(d => d.isActive).forEach(del => {
        graph.edges.push({
          from: credentialNodeId,
          to: `contador-${del.delegatedTo}`,
          relationship: 'DELEGATED_TO',
          label: 'delegado a',
          dashed: true,
          expiresAt: del.expiresAt
        });
      });
    });

    res.json({
      success: true,
      data: graph,
      userRole: userRole, // Enviar el rol al frontend
      viewType: userRole === 'admin' ? 'full' : (userRole === 'contador' ? 'contador' : 'cliente'),
      stats: {
        totalNodes: graph.nodes.length,
        totalEdges: graph.edges.length,
        contadores: contadores.length,
        clientes: clientesAgregados.size,
        credentials: credentials.length
      }
    });

  } catch (error) {
    console.error('Error al obtener grafo completo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener grafo completo',
      error: error.message
    });
  }
};

// ===================
// GESTIÓN DE DELEGACIONES
// ===================

/**
 * Crear una delegación de acceso
 */
exports.createDelegation = async (req, res) => {
  try {
    const { id } = req.params; // ID de la credencial
    const { delegatedToId, permissions, expiresAt } = req.body;
    
    const userId = req.user?._id;
    const userRole = req.user?.rol;

    // Verificar que tiene permiso de edición
    const hasAccess = await SRICredential.hasAccess(id, userId, userRole, 'edit');
    if (!hasAccess && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para delegar acceso a esta credencial'
      });
    }

    // Buscar el usuario al que se delega
    const delegatedUser = await User.findById(delegatedToId);
    if (!delegatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Obtener la credencial
    const credential = await SRICredential.findById(id);
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credencial no encontrada'
      });
    }

    // Crear la delegación
    await credential.addDelegation(
      delegatedUser._id,
      delegatedUser.nombre,
      userId,
      req.user.nombre,
      permissions || ['view'],
      new Date(expiresAt)
    );

    res.json({
      success: true,
      message: 'Delegación creada exitosamente',
      data: {
        delegatedTo: delegatedUser.nombre,
        permissions,
        expiresAt
      }
    });

  } catch (error) {
    console.error('Error al crear delegación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear delegación',
      error: error.message
    });
  }
};

/**
 * Revocar una delegación
 */
exports.revokeDelegation = async (req, res) => {
  try {
    const { id, delegationUserId } = req.params;
    
    const credential = await SRICredential.findById(id);
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credencial no encontrada'
      });
    }

    const revoked = await credential.revokeDelegation(delegationUserId);
    
    if (!revoked) {
      return res.status(404).json({
        success: false,
        message: 'Delegación no encontrada o ya revocada'
      });
    }

    res.json({
      success: true,
      message: 'Delegación revocada exitosamente'
    });

  } catch (error) {
    console.error('Error al revocar delegación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al revocar delegación',
      error: error.message
    });
  }
};

// ====================
// OBTENER LOGS DE ACCESO
// ====================
exports.getAccessLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.rol;

    // Solo admin y contador asignado pueden ver logs
    if (userRole !== 'admin' && userRole !== 'contador') {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para ver los logs de acceso'
      });
    }

    const credential = await SRICredential.findById(id)
      .select('credentialId accessLog')
      .populate('accessLog.accessedBy', 'nombre email');

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credencial no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        credentialId: credential.credentialId,
        logs: credential.accessLog.slice(-50).reverse() // Últimos 50 accesos
      }
    });

  } catch (error) {
    console.error('Error al obtener logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener logs de acceso',
      error: error.message
    });
  }
};

// ===================================
// OBTENER CREDENCIALES POR CONTADOR
// ===================================
exports.getCredentialsByContador = async (req, res) => {
  try {
    const { contadorId } = req.params;

    const credentials = await SRICredential.find({ 
      assignedContador: contadorId,
      status: 'active'
    })
    .populate('customer', 'customerNumber fullName email')
    .select('-sriPassword -accessLog');

    res.json({
      success: true,
      count: credentials.length,
      data: credentials
    });

  } catch (error) {
    console.error('Error al obtener credenciales por contador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener credenciales',
      error: error.message
    });
  }
};
