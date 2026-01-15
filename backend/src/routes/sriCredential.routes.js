const express = require('express');
const router = express.Router();
const sriCredentialController = require('../controllers/sriCredential.controller');

/**
 * ================================================
 * RUTAS DE CREDENCIALES SRI - SISTEMA CON GRAFOS
 * ================================================
 * 
 * Estructura del Grafo de Acceso:
 * 
 *   [Admin]
 *      │
 *      ├── /all (GET) ────────────────► Ver todas las credenciales
 *      ├── /graph (GET) ──────────────► Ver grafo completo
 *      │
 *   [Contador]
 *      │
 *      ├── / (GET) ───────────────────► Ver credenciales asignadas + delegadas
 *      ├── /:id (GET) ────────────────► Ver detalle (si tiene acceso en grafo)
 *      ├── /:id (PUT) ────────────────► Editar (si tiene acceso en grafo)
 *      ├── /:id/delegate (POST) ──────► Delegar acceso a otro usuario
 *      │
 *   [Cliente]
 *      │
 *      └── /customer/:customerNumber ─► Ver solo sus credenciales
 */

// ========================
// RUTAS CRUD PRINCIPALES
// ========================

// Crear nueva credencial SRI
// POST /api/sri-credentials
router.post('/', sriCredentialController.createSRICredential);

// Obtener todas las credenciales (filtradas según rol del usuario)
// GET /api/sri-credentials
router.get('/', sriCredentialController.getAllCredentials);

// Obtener credencial por ID
// GET /api/sri-credentials/:id
router.get('/:id', sriCredentialController.getCredentialById);

// Obtener credencial por número de cliente
// GET /api/sri-credentials/customer/:customerNumber
router.get('/customer/:customerNumber', sriCredentialController.getCredentialByCustomer);

// Actualizar credencial
// PUT /api/sri-credentials/:id
router.put('/:id', sriCredentialController.updateCredential);

// Eliminar credencial (solo admin)
// DELETE /api/sri-credentials/:id
router.delete('/:id', sriCredentialController.deleteCredential);

// ========================
// RUTAS DEL GRAFO
// ========================

// Obtener grafo visual de una credencial específica
// GET /api/sri-credentials/:id/graph
// Retorna: nodos (credencial, cliente, contador) y aristas (relaciones)
router.get('/:id/graph', sriCredentialController.getCredentialGraph);

// Obtener grafo completo del sistema (solo admin)
// GET /api/sri-credentials/admin/full-graph
// Retorna: Jerarquía completa Admin → Contadores → Clientes → Credenciales
router.get('/admin/full-graph', sriCredentialController.getFullCredentialsGraph);

// Obtener credenciales asignadas a un contador específico
// GET /api/sri-credentials/contador/:contadorId
router.get('/contador/:contadorId', sriCredentialController.getCredentialsByContador);

// ========================
// RUTAS DE DELEGACIÓN
// ========================

// Crear delegación de acceso
// POST /api/sri-credentials/:id/delegate
// Body: { delegatedToId, permissions: ['view'|'edit'], expiresAt }
router.post('/:id/delegate', sriCredentialController.createDelegation);

// Revocar delegación
// DELETE /api/sri-credentials/:id/delegate/:delegationUserId
router.delete('/:id/delegate/:delegationUserId', sriCredentialController.revokeDelegation);

// ========================
// RUTAS DE AUDITORÍA
// ========================

// Obtener logs de acceso de una credencial
// GET /api/sri-credentials/:id/logs
router.get('/:id/logs', sriCredentialController.getAccessLogs);

module.exports = router;
