const User = require('../models/User');
const Customer = require('../models/Customer');
const SRICredential = require('../models/SRICredential');

/**
 * =====================================================
 * SEMILLA DE CREDENCIALES SRI CON ESTRUCTURA DE GRAFO
 * =====================================================
 * 
 * Estructura del Grafo:
 * 
 *   [ADMIN]
 *      │
 *      ├── Contador 1 (María Rodríguez)
 *      │     ├── Cliente TB-000001 (Juan Pérez)
 *      │     │     ├── Credencial SRI (Persona Natural)
 *      │     │     ├── Credencial SRI (RISE)
 *      │     │     └── Credencial SRI (Consultoría)
 *      │     │
 *      │     └── Cliente TB-000002 (Ana García)
 *      │           ├── Credencial SRI (Persona Natural)
 *      │           ├── Credencial SRI (Sociedad)
 *      │           └── Credencial SRI (Comercio)
 *      │
 *      └── Contador 2 (Carlos Sánchez)
 *            └── Cliente TB-000003 (Pedro Martínez)
 *                  ├── Credencial SRI (Persona Natural)
 *                  ├── Credencial SRI (Sociedad)
 *                  └── Credencial SRI (Tecnología)
 */

// Limpiar credenciales, clientes y contadores de prueba
async function clearSRIData() {
  try {
    console.log('🗑️  Limpiando credenciales SRI, clientes y contadores...');
    
    // Eliminar credenciales de prueba
    await SRICredential.deleteMany({ 
      credentialId: { $regex: /^SRI-TEST-/ } 
    });
    
    // Eliminar clientes de prueba
    await Customer.deleteMany({ 
      customerNumber: { $in: ['TB-SRI-001', 'TB-SRI-002', 'TB-SRI-003'] }
    });
    
    // Eliminar contadores de prueba
    await User.deleteMany({ 
      email: { $in: ['maria.contador@taxbridge.com', 'carlos.contador@taxbridge.com'] }
    });
    
    console.log('✅ Datos de SRI limpiados');
  } catch (error) {
    console.error('❌ Error al limpiar datos de SRI:', error);
    throw error;
  }
}

// Crear semilla de credenciales SRI
async function seedSRICredentials() {
  try {
    console.log('🌱 Creando semilla de credenciales SRI...\n');

    // ===================
    // PASO 1: CONTADORES
    // ===================
    console.log('👤 Creando contadores...');
    
    const contador1 = await User.create({
      nombre: 'María Rodríguez',
      email: 'maria.contador@taxbridge.com',
      password: 'Contador1!',
      rol: 'contador',
      activo: true,
      especialidad: 'Contabilidad General y Tributaria'
    });

    const contador2 = await User.create({
      nombre: 'Carlos Sánchez',
      email: 'carlos.contador@taxbridge.com',
      password: 'Contador2!',
      rol: 'contador',
      activo: true,
      especialidad: 'Auditoría y Consultoría Fiscal'
    });

    console.log(`  ✓ ${contador1.nombre} (ID: ${contador1._id})`);
    console.log(`  ✓ ${contador2.nombre} (ID: ${contador2._id})\n`);

    // ================
    // PASO 2: CLIENTES
    // ================
    console.log('👥 Creando clientes...');
    
    const cliente1 = await Customer.create({
      customerNumber: 'TB-SRI-001',
      fullName: 'Juan Pérez López',
      email: 'juan.perez.sri@example.com',
      password: 'JuanPerez123!',
      isTemporaryPassword: false,
      phone: '0998765432',
      identification: '1712345678',
      paymentMethod: 'card',
      status: 'active',
      purchasedProducts: [
        {
          productId: 'PROD-001',
          productName: 'Declaración de Impuestos - Persona Natural',
          quantity: 1,
          unitPrice: 120.00,
          totalPrice: 120.00,
          category: 'Tributación'
        }
      ],
      totalPurchases: 120.00,
      lastPurchaseDate: new Date()
    });

    const cliente2 = await Customer.create({
      customerNumber: 'TB-SRI-002',
      fullName: 'Ana María García Torres',
      email: 'ana.garcia.sri@example.com',
      password: 'AnaGarcia123!',
      isTemporaryPassword: false,
      phone: '0987654321',
      identification: '1723456789',
      paymentMethod: 'transfer',
      status: 'active',
      purchasedProducts: [
        {
          productId: 'PROD-002',
          productName: 'Contabilidad Empresarial',
          quantity: 1,
          unitPrice: 250.00,
          totalPrice: 250.00,
          category: 'Contabilidad'
        }
      ],
      totalPurchases: 250.00,
      lastPurchaseDate: new Date()
    });

    const cliente3 = await Customer.create({
      customerNumber: 'TB-SRI-003',
      fullName: 'Pedro Antonio Martínez Silva',
      email: 'pedro.martinez.sri@example.com',
      password: 'PedroMartinez123!',
      isTemporaryPassword: false,
      phone: '0976543210',
      identification: '1734567890',
      paymentMethod: 'card',
      status: 'active',
      purchasedProducts: [
        {
          productId: 'PROD-003',
          productName: 'Asesoría Fiscal Integral',
          quantity: 1,
          unitPrice: 350.00,
          totalPrice: 350.00,
          category: 'Consultoría'
        }
      ],
      totalPurchases: 350.00,
      lastPurchaseDate: new Date()
    });

    console.log(`  ✓ ${cliente1.fullName} (${cliente1.customerNumber})`);
    console.log(`  ✓ ${cliente2.fullName} (${cliente2.customerNumber})`);
    console.log(`  ✓ ${cliente3.fullName} (${cliente3.customerNumber})\n`);

    // ======================
    // PASO 3: CREDENCIALES SRI
    // ======================
    console.log('🔐 Creando credenciales SRI...\n');

    // ----------------
    // CLIENTE 1 - Juan Pérez (3 credenciales)
    // Asignado a: Contador 1 (María)
    // ----------------
    console.log(`  📁 Credenciales para ${cliente1.fullName}:`);
    
    const cred1_1 = await SRICredential.create({
      credentialId: await SRICredential.generateCredentialId(),
      customer: cliente1._id,
      customerNumber: cliente1.customerNumber,
      customerName: cliente1.fullName,
      assignedContador: contador1._id,
      assignedContadorName: contador1.nombre,
      sriUsername: 'jperez',
      sriPassword: 'SRI2024Pass!',
      ruc: '1712345678001',
      tipoContribuyente: 'persona_natural',
      razonSocial: 'Juan Pérez López',
      status: 'active',
      notes: 'Credencial principal para declaraciones mensuales',
      parentNodes: [
        { nodeType: 'customer', nodeId: cliente1._id },
        { nodeType: 'contador', nodeId: contador1._id }
      ],
      graphDepth: 2
    });

    const cred1_2 = await SRICredential.create({
      credentialId: await SRICredential.generateCredentialId(),
      customer: cliente1._id,
      customerNumber: cliente1.customerNumber,
      customerName: cliente1.fullName,
      assignedContador: contador1._id,
      assignedContadorName: contador1.nombre,
      sriUsername: 'jperez_rise',
      sriPassword: 'SRI2024Rise!',
      ruc: '1712345678002',
      tipoContribuyente: 'rise',
      razonSocial: 'Comercio Juan Pérez',
      status: 'active',
      notes: 'Negocio RISE - Pequeño comercio',
      parentNodes: [
        { nodeType: 'customer', nodeId: cliente1._id },
        { nodeType: 'contador', nodeId: contador1._id }
      ],
      graphDepth: 2
    });

    const cred1_3 = await SRICredential.create({
      credentialId: await SRICredential.generateCredentialId(),
      customer: cliente1._id,
      customerNumber: cliente1.customerNumber,
      customerName: cliente1.fullName,
      assignedContador: contador1._id,
      assignedContadorName: contador1.nombre,
      sriUsername: 'jperez_consultoria',
      sriPassword: 'SRI2024Cons!',
      ruc: '1712345678003',
      tipoContribuyente: 'persona_natural',
      razonSocial: 'Consultoría JP',
      status: 'active',
      notes: 'Actividad profesional independiente',
      parentNodes: [
        { nodeType: 'customer', nodeId: cliente1._id },
        { nodeType: 'contador', nodeId: contador1._id }
      ],
      graphDepth: 2
    });

    console.log(`    ✓ ${cred1_1.credentialId} - ${cred1_1.ruc} (${cred1_1.tipoContribuyente})`);
    console.log(`    ✓ ${cred1_2.credentialId} - ${cred1_2.ruc} (${cred1_2.tipoContribuyente})`);
    console.log(`    ✓ ${cred1_3.credentialId} - ${cred1_3.ruc} (${cred1_3.tipoContribuyente})\n`);

    // ----------------
    // CLIENTE 2 - Ana García (3 credenciales)
    // Asignado a: Contador 1 (María)
    // ----------------
    console.log(`  📁 Credenciales para ${cliente2.fullName}:`);
    
    const cred2_1 = await SRICredential.create({
      credentialId: await SRICredential.generateCredentialId(),
      customer: cliente2._id,
      customerNumber: cliente2.customerNumber,
      customerName: cliente2.fullName,
      assignedContador: contador1._id,
      assignedContadorName: contador1.nombre,
      sriUsername: 'agarcia',
      sriPassword: 'SRI2024Ana!',
      ruc: '1723456789001',
      tipoContribuyente: 'persona_natural',
      razonSocial: 'Ana María García Torres',
      status: 'active',
      notes: 'Credencial personal',
      parentNodes: [
        { nodeType: 'customer', nodeId: cliente2._id },
        { nodeType: 'contador', nodeId: contador1._id }
      ],
      graphDepth: 2
    });

    const cred2_2 = await SRICredential.create({
      credentialId: await SRICredential.generateCredentialId(),
      customer: cliente2._id,
      customerNumber: cliente2.customerNumber,
      customerName: cliente2.fullName,
      assignedContador: contador1._id,
      assignedContadorName: contador1.nombre,
      sriUsername: 'agarcia_empresa',
      sriPassword: 'SRI2024Emp!',
      ruc: '1723456789002',
      tipoContribuyente: 'sociedad',
      razonSocial: 'García & Asociados Cía. Ltda.',
      status: 'active',
      notes: 'Empresa familiar de comercio',
      parentNodes: [
        { nodeType: 'customer', nodeId: cliente2._id },
        { nodeType: 'contador', nodeId: contador1._id }
      ],
      graphDepth: 2
    });

    const cred2_3 = await SRICredential.create({
      credentialId: await SRICredential.generateCredentialId(),
      customer: cliente2._id,
      customerNumber: cliente2.customerNumber,
      customerName: cliente2.fullName,
      assignedContador: contador1._id,
      assignedContadorName: contador1.nombre,
      sriUsername: 'agarcia_comercio',
      sriPassword: 'SRI2024Com!',
      ruc: '1723456789003',
      tipoContribuyente: 'persona_natural',
      razonSocial: 'Comercial Ana García',
      status: 'active',
      notes: 'Local comercial independiente',
      parentNodes: [
        { nodeType: 'customer', nodeId: cliente2._id },
        { nodeType: 'contador', nodeId: contador1._id }
      ],
      graphDepth: 2
    });

    console.log(`    ✓ ${cred2_1.credentialId} - ${cred2_1.ruc} (${cred2_1.tipoContribuyente})`);
    console.log(`    ✓ ${cred2_2.credentialId} - ${cred2_2.ruc} (${cred2_2.tipoContribuyente})`);
    console.log(`    ✓ ${cred2_3.credentialId} - ${cred2_3.ruc} (${cred2_3.tipoContribuyente})\n`);

    // ----------------
    // CLIENTE 3 - Pedro Martínez (3 credenciales)
    // Asignado a: Contador 2 (Carlos)
    // ----------------
    console.log(`  📁 Credenciales para ${cliente3.fullName}:`);
    
    const cred3_1 = await SRICredential.create({
      credentialId: await SRICredential.generateCredentialId(),
      customer: cliente3._id,
      customerNumber: cliente3.customerNumber,
      customerName: cliente3.fullName,
      assignedContador: contador2._id,
      assignedContadorName: contador2.nombre,
      sriUsername: 'pmartinez',
      sriPassword: 'SRI2024Pedro!',
      ruc: '1734567890001',
      tipoContribuyente: 'persona_natural',
      razonSocial: 'Pedro Antonio Martínez Silva',
      status: 'active',
      notes: 'Credencial principal',
      parentNodes: [
        { nodeType: 'customer', nodeId: cliente3._id },
        { nodeType: 'contador', nodeId: contador2._id }
      ],
      graphDepth: 2
    });

    const cred3_2 = await SRICredential.create({
      credentialId: await SRICredential.generateCredentialId(),
      customer: cliente3._id,
      customerNumber: cliente3.customerNumber,
      customerName: cliente3.fullName,
      assignedContador: contador2._id,
      assignedContadorName: contador2.nombre,
      sriUsername: 'pmartinez_tech',
      sriPassword: 'SRI2024Tech!',
      ruc: '1734567890002',
      tipoContribuyente: 'sociedad',
      razonSocial: 'Tech Solutions Martínez S.A.',
      status: 'active',
      notes: 'Empresa de tecnología',
      parentNodes: [
        { nodeType: 'customer', nodeId: cliente3._id },
        { nodeType: 'contador', nodeId: contador2._id }
      ],
      graphDepth: 2
    });

    const cred3_3 = await SRICredential.create({
      credentialId: await SRICredential.generateCredentialId(),
      customer: cliente3._id,
      customerNumber: cliente3.customerNumber,
      customerName: cliente3.fullName,
      assignedContador: contador2._id,
      assignedContadorName: contador2.nombre,
      sriUsername: 'pmartinez_dev',
      sriPassword: 'SRI2024Dev!',
      ruc: '1734567890003',
      tipoContribuyente: 'persona_natural',
      razonSocial: 'Desarrollo de Software PM',
      status: 'active',
      notes: 'Servicios profesionales de desarrollo',
      parentNodes: [
        { nodeType: 'customer', nodeId: cliente3._id },
        { nodeType: 'contador', nodeId: contador2._id }
      ],
      graphDepth: 2
    });

    console.log(`    ✓ ${cred3_1.credentialId} - ${cred3_1.ruc} (${cred3_1.tipoContribuyente})`);
    console.log(`    ✓ ${cred3_2.credentialId} - ${cred3_2.ruc} (${cred3_2.tipoContribuyente})`);
    console.log(`    ✓ ${cred3_3.credentialId} - ${cred3_3.ruc} (${cred3_3.tipoContribuyente})\n`);

    // ======================
    // RESUMEN FINAL
    // ======================
    console.log('📊 Resumen de la estructura del grafo:\n');
    console.log('┌─ ADMIN (Raíz)');
    console.log('│');
    console.log(`├─┬─ Contador: ${contador1.nombre}`);
    console.log('│ │');
    console.log(`│ ├─┬─ Cliente: ${cliente1.fullName} (${cliente1.customerNumber})`);
    console.log(`│ │ ├── ${cred1_1.credentialId} (Persona Natural)`);
    console.log(`│ │ ├── ${cred1_2.credentialId} (RISE)`);
    console.log(`│ │ └── ${cred1_3.credentialId} (Consultoría)`);
    console.log('│ │');
    console.log(`│ └─┬─ Cliente: ${cliente2.fullName} (${cliente2.customerNumber})`);
    console.log(`│   ├── ${cred2_1.credentialId} (Persona Natural)`);
    console.log(`│   ├── ${cred2_2.credentialId} (Sociedad)`);
    console.log(`│   └── ${cred2_3.credentialId} (Comercio)`);
    console.log('│');
    console.log(`└─┬─ Contador: ${contador2.nombre}`);
    console.log('  │');
    console.log(`  └─┬─ Cliente: ${cliente3.fullName} (${cliente3.customerNumber})`);
    console.log(`    ├── ${cred3_1.credentialId} (Persona Natural)`);
    console.log(`    ├── ${cred3_2.credentialId} (Sociedad - Tech)`);
    console.log(`    └── ${cred3_3.credentialId} (Desarrollo)`);
    console.log('');

    console.log('✅ Semilla de credenciales SRI completada\n');
    console.log('📈 Estadísticas:');
    console.log(`   - Contadores: 2`);
    console.log(`   - Clientes: 3`);
    console.log(`   - Credenciales: 9`);
    console.log(`   - Total nodos en grafo: 14 (1 admin + 2 contadores + 3 clientes + 9 credenciales)`);
    console.log('');

  } catch (error) {
    console.error('❌ Error al crear semilla de credenciales SRI:', error);
    throw error;
  }
}

module.exports = { clearSRIData, seedSRICredentials };
