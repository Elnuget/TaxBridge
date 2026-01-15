# 🚀 Guía Rápida - Visualizar el Grafo Mejorado

## 📋 Checklist Antes de Comenzar

- [ ] Backend corriendo en `http://localhost:3000`
- [ ] Frontend corriendo en `http://localhost:4200`
- [ ] Datos de semilla cargados en la base de datos

## ▶️ Inicio Rápido

### 1. Iniciar Backend (Terminal 1)
```bash
cd c:/Users/cangu/Documents/TaxBridge/backend
node src/server.js
```

Espera a ver: `✅ Server running on port 3000`

### 2. Iniciar Frontend (Terminal 2)
```bash
cd c:/Users/cangu/Documents/TaxBridge/frontend/taxbridge-frontend
npm run dev
```

Espera a ver: `✓ Compiled successfully`

### 3. Abrir el Grafo
Abre tu navegador en: **`http://localhost:4200/sri-credentials/graph`**

## 🎯 Qué Esperar Ver

### Estructura Visual Esperada:

```
┌────────────────────────────────────────────┐
│   🛡️  ADMINISTRACIÓN TAXBRIDGE             │
└─────────────────┬──────────────────────────┘
                  ↓ gestiona
     
     ┌──────────────────┐        ┌──────────────────┐
     │  👤 María        │        │  👤 Carlos       │
     │  Rodríguez       │        │  Sánchez         │
     │                  │        │                  │
     │  ↓ atiende a     │        │  ↓ atiende a     │
     │                  │        │                  │
     │  👥 Juan Pérez   │        │  👥 Pedro        │
     │  TB-SRI-001      │        │  Martínez        │
     │  ↓ posee         │        │  TB-SRI-003      │
     │  🔐 3 credenc.   │        │  ↓ posee         │
     │                  │        │  🔐 3 credenc.   │
     │  👥 Ana García   │        └──────────────────┘
     │  TB-SRI-002      │
     │  ↓ posee         │
     │  🔐 3 credenc.   │
     └──────────────────┘
```

### Elementos Visuales:

#### 🎨 Colores por Nivel
- **Rojo**: Administración (Nodo raíz)
- **Azul**: Contadores (María y Carlos)
- **Verde**: Clientes (Juan, Ana, Pedro)
- **Naranja**: Credenciales SRI

#### ➡️ Flechas con Etiquetas
- `gestiona` - Admin → Contador
- `atiende a` - Contador → Cliente
- `posee` - Cliente → Credenciales

#### 📊 Estadísticas en la Parte Superior
```
┌──────┬──────┬──────┬──────┬──────┬──────┐
│  17  │  16  │   2  │   3  │  11  │   0  │
│Nodos │Conex │Conta │Clien │Crede │Deleg │
└──────┴──────┴──────┴──────┴──────┴──────┘
```

## 🔍 Verificación del Backend

### Test Manual del Endpoint
```bash
curl http://localhost:3000/api/sri-credentials/admin/full-graph
```

**Respuesta esperada (resumida)**:
```json
{
  "success": true,
  "data": {
    "nodes": [ /* 17 nodos */ ],
    "edges": [ /* 16 aristas */ ]
  },
  "stats": {
    "totalNodes": 17,
    "totalEdges": 16,
    "contadores": 2,
    "clientes": 3,
    "credentials": 11
  }
}
```

### Test desde PowerShell
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/sri-credentials/admin/full-graph" | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

## 🐛 Solución de Problemas Comunes

### Problema: "Cannot GET /sri-credentials/graph"
**Solución**: Asegúrate de estar en `http://localhost:4200` (con el 4200, no 3000)

### Problema: Grafo vacío o error 404
**Verificar**:
1. Backend está corriendo
2. Datos de semilla están cargados
3. Navegador no tiene errores en consola (F12)

**Recargar datos**:
```bash
cd backend
node src/seeds/index.js reset
```

### Problema: Las cards no se ven bien
**Solución**:
1. Limpiar caché: `Ctrl + Shift + Delete`
2. Hard reload: `Ctrl + Shift + R`
3. Verificar que Angular compiló sin errores

### Problema: "Error al obtener grafo"
**Verificar en DevTools (F12)**:
- Network tab → Buscar `full-graph`
- Ver si devuelve 200 OK
- Si devuelve 500, revisar logs del backend

## 📱 Vista Responsive

### Desktop (>1200px)
- 2-3 cards de contadores por fila
- Credenciales en grid de 3 columnas

### Tablet (768px - 1200px)
- 1-2 cards de contadores por fila
- Credenciales en grid de 2 columnas

### Mobile (<768px)
- 1 card de contador por fila
- Credenciales apiladas verticalmente

## 🎭 Interacciones

- **Hover sobre nodos**: Se elevan con sombra
- **Hover sobre cards**: Efecto de elevación
- **Flechas animadas**: Efecto pulse continuo
- **Botón Actualizar**: Recarga los datos del grafo

## 📷 Capturas de Referencia

### Vista Completa Esperada
El grafo debe mostrar:
1. ✅ Título "Grafo de Credenciales SRI"
2. ✅ Leyenda con colores explicativos
3. ✅ 6 tarjetas de estadísticas
4. ✅ 1 nodo Admin centrado
5. ✅ 2 cards azules para contadores (María y Carlos)
6. ✅ Dentro de cada card: clientes (verde) y credenciales (naranja)
7. ✅ Flechas con etiquetas descriptivas
8. ✅ Footer con explicación del grafo

### Jerarquía Clara
```
Admin (1 nodo rojo)
  ├── María Rodríguez (card azul)
  │   ├── Juan Pérez + 3 credenciales
  │   └── Ana García + 3 credenciales
  └── Carlos Sánchez (card azul)
      └── Pedro Martínez + 3 credenciales
```

## ✅ Lista de Verificación Final

Antes de dar por terminada la prueba, verifica:

- [ ] El grafo muestra 17 nodos en total
- [ ] Hay 16 conexiones (aristas)
- [ ] Se ven 2 cards azules (contadores)
- [ ] Cada contador muestra sus clientes asignados
- [ ] Cada cliente muestra sus 3 credenciales
- [ ] Las etiquetas de las flechas son legibles
- [ ] El diseño es responsive (prueba redimensionando)
- [ ] No hay errores en la consola del navegador
- [ ] El botón "Actualizar" funciona
- [ ] El botón "Ver Lista" redirige a `/sri-credentials`

## 📞 ¿Necesitas Ayuda?

### Revisar archivos modificados:
```
backend/src/controllers/sriCredential.controller.js  (líneas 465-650)
frontend/.../sri-credentials-graph.ts
frontend/.../sri-credentials-graph.html
frontend/.../sri-credentials-graph.scss
frontend/.../sri-credential.service.ts (interfaces)
```

### Logs útiles:
```bash
# Backend
cd backend && npm start 2>&1 | tee backend.log

# Frontend
cd frontend/taxbridge-frontend && npm run dev 2>&1 | tee frontend.log
```

## 🎉 ¡Listo!

Si todo está funcionando correctamente, deberías ver un grafo jerárquico hermoso y funcional que muestra claramente:
- Qué contador gestiona qué clientes
- Qué clientes tienen qué credenciales
- Todas las relaciones visualizadas de forma clara

**Disfruta del grafo mejorado!** 🚀
