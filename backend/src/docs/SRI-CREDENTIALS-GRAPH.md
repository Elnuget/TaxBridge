# 📊 Módulo de Credenciales SRI con GRAFOS

## Descripción General

Este módulo implementa la gestión de credenciales del **SRI (Servicio de Rentas Internas)** utilizando una **estructura de grafos** para el control de acceso y visualización de relaciones.

---

## 🔷 ¿Qué es un GRAFO en este contexto?

Un **grafo** es una estructura de datos que consiste en:
- **Nodos (Vertices)**: Entidades del sistema
- **Aristas (Edges)**: Relaciones entre entidades

### Estructura del Grafo de Credenciales SRI

```
                     ┌─────────────────┐
                     │     ADMIN       │ ◄─── Nivel 0 (Raíz del grafo)
                     │   (Usuario)     │
                     └────────┬────────┘
                              │
                    ┌─────────┴─────────┐
                    │     GESTIONA      │  ◄─── Arista tipo "MANAGES"
                    ▼                   ▼
           ┌────────────────┐  ┌────────────────┐
           │   CONTADOR 1   │  │   CONTADOR 2   │ ◄─── Nivel 1
           │   (Usuario)    │  │   (Usuario)    │
           └───────┬────────┘  └───────┬────────┘
                   │                   │
          ┌────────┴────────┐         ▼
          │   ASIGNADO A    │  ◄─── Arista tipo "ASSIGNED_TO"
          ▼                 ▼
   ┌─────────────┐  ┌─────────────┐
   │  CLIENTE A  │  │  CLIENTE B  │   ◄─── Nivel 2
   │ (Customer)  │  │ (Customer)  │
   └──────┬──────┘  └──────┬──────┘
          │                │
          │   POSEE        │  ◄─── Arista tipo "OWNS"
          ▼                ▼
   ┌─────────────┐  ┌─────────────┐
   │ CREDENCIAL  │  │ CREDENCIAL  │   ◄─── Nivel 3 (Hojas)
   │    SRI-A    │  │    SRI-B    │
   └─────────────┘  └─────────────┘
          │
          │   DELEGADO A   ◄─── Arista tipo "DELEGATED_TO" (temporal, punteada)
          ▼
   ┌─────────────┐
   │ OTRO USER   │   ◄─── Delegación temporal
   └─────────────┘
```

---

## 🎯 Funciones del GRAFO

### 1. **Control de Acceso Jerárquico**

El grafo determina **quién puede ver qué credenciales** basándose en la posición del usuario en la jerarquía:

| Rol | Acceso |
|-----|--------|
| **Admin** | Todas las credenciales (raíz del grafo) |
| **Contador** | Solo credenciales asignadas + delegadas |
| **Cliente** | Solo sus propias credenciales |

```javascript
// Ejemplo de traversía del grafo para control de acceso
async getAccessibleCredentials(userId, userRole) {
  switch (userRole) {
    case 'admin':
      // Traversía completa desde la raíz
      return this.find({ status: 'active' });
    
    case 'contador':
      // Solo nodos conectados directamente o por delegación
      return this.find({
        $or: [
          { assignedContador: userId },
          { 'delegations.delegatedTo': userId }
        ]
      });
    
    case 'cliente':
      // Solo nodos hijos del cliente
      return this.find({ customer: customerId });
  }
}
```

### 2. **Delegación de Permisos (Aristas Temporales)**

Las delegaciones son **aristas adicionales** en el grafo que permiten acceso temporal:

```
   ┌─────────────┐
   │ CREDENCIAL  │
   │    SRI-A    │
   └──────┬──────┘
          │
          │ ─ ─ ─ ─ ─ ─► [CONTADOR 2]  (línea punteada = temporal)
          │               │
          │               ├── permissions: ['view', 'edit']
          │               ├── expiresAt: 2026-02-14
          │               └── delegatedBy: CONTADOR 1
```

### 3. **Auditoría de Accesos**

Cada nodo (credencial) mantiene un **log de accesos**:

```javascript
accessLog: [
  {
    accessedBy: ObjectId("user123"),
    accessedByName: "Juan Pérez",
    accessType: "view",  // view, edit, create, delete, export
    accessedAt: Date,
    ipAddress: "192.168.1.100"
  }
]
```

### 4. **Visualización del Grafo**

El endpoint `/api/sri-credentials/admin/full-graph` retorna la estructura completa para visualización:

```json
{
  "nodes": [
    { "id": "admin-root", "type": "admin", "label": "Administración", "level": 0 },
    { "id": "contador-123", "type": "contador", "label": "María García", "level": 1 },
    { "id": "customer-456", "type": "customer", "label": "Cliente ABC", "level": 2 },
    { "id": "credential-789", "type": "credential", "label": "SRI: 1234567890001", "level": 3 }
  ],
  "edges": [
    { "from": "admin-root", "to": "contador-123", "relationship": "MANAGES" },
    { "from": "contador-123", "to": "customer-456", "relationship": "ASSIGNED_TO" },
    { "from": "customer-456", "to": "credential-789", "relationship": "OWNS" }
  ]
}
```

---

## 📁 Archivos del Módulo

### Backend

| Archivo | Descripción |
|---------|-------------|
| `models/SRICredential.js` | Modelo con funciones de grafo integradas |
| `controllers/sriCredential.controller.js` | Lógica de negocio y control de acceso |
| `routes/sriCredential.routes.js` | Endpoints de la API |

### Frontend

| Archivo | Descripción |
|---------|-------------|
| `services/sri-credential.service.ts` | Servicio Angular con métodos del grafo |
| `pages/sri-credentials/sri-credentials-index.*` | Listado de credenciales |
| `pages/sri-credentials/sri-credentials-graph.*` | Visualización del grafo |

---

## 🔌 API Endpoints

### CRUD Básico
```
POST   /api/sri-credentials          - Crear credencial
GET    /api/sri-credentials          - Listar (filtrado por grafo)
GET    /api/sri-credentials/:id      - Obtener una
PUT    /api/sri-credentials/:id      - Actualizar
DELETE /api/sri-credentials/:id      - Eliminar (solo admin)
```

### Operaciones del Grafo
```
GET    /api/sri-credentials/:id/graph         - Grafo de una credencial
GET    /api/sri-credentials/admin/full-graph  - Grafo completo (admin)
GET    /api/sri-credentials/contador/:id      - Credenciales de un contador
```

### Delegaciones
```
POST   /api/sri-credentials/:id/delegate              - Crear delegación
DELETE /api/sri-credentials/:id/delegate/:userId      - Revocar delegación
```

### Auditoría
```
GET    /api/sri-credentials/:id/logs  - Logs de acceso
```

---

## 🔐 Seguridad

### Encriptación de Credenciales

Las credenciales del SRI (usuario y contraseña) se almacenan **encriptadas** con AES-256-CBC:

```javascript
// Encriptar antes de guardar
sriUsername: { set: encrypt, get: decrypt }
sriPassword: { set: encrypt, get: decrypt }
```

### Control de Acceso

Cada operación valida el acceso mediante traversía del grafo:

```javascript
// Verificar si userId tiene acceso a credentialId
const hasAccess = await SRICredential.hasAccess(credentialId, userId, userRole, 'view');
```

---

## 🚀 Uso

### Crear una Credencial

```bash
POST /api/sri-credentials
{
  "customerNumber": "TB-000001",
  "sriUsername": "mi_usuario_sri",
  "sriPassword": "mi_clave_sri",
  "ruc": "1234567890001",
  "tipoContribuyente": "persona_natural",
  "assignedContadorId": "contador_id"
}
```

### Delegar Acceso

```bash
POST /api/sri-credentials/:id/delegate
{
  "delegatedToId": "otro_contador_id",
  "permissions": ["view", "edit"],
  "expiresAt": "2026-03-15T00:00:00.000Z"
}
```

### Obtener Grafo Completo

```bash
GET /api/sri-credentials/admin/full-graph
# Retorna estructura de nodos y aristas para visualización
```

---

## 📊 Integración con Bibliotecas de Visualización

El servicio incluye métodos para convertir el grafo a formatos compatibles con bibliotecas populares:

```typescript
// Angular Service
const graph = await this.sriService.getFullGraph();
const visJsData = this.sriService.convertToVisJsFormat(graph.data);

// Usar con vis.js
new vis.Network(container, visJsData, options);
```

Bibliotecas recomendadas:
- **vis.js** - Grafos interactivos
- **D3.js** - Visualizaciones personalizadas
- **Cytoscape.js** - Análisis de grafos

---

## 📝 Resumen

El **grafo de credenciales SRI** proporciona:

✅ **Control de acceso jerárquico** basado en la estructura de relaciones
✅ **Delegación temporal** de permisos entre usuarios
✅ **Auditoría completa** de todos los accesos
✅ **Visualización clara** de la estructura organizacional
✅ **Seguridad** con encriptación de datos sensibles
✅ **API RESTful** completa para integración
