# 🌱 Sistema de Semillas (Seeds) - TaxBridge

Este documento explica cómo usar el sistema de semillas para poblar la base de datos con datos de prueba.

## 📋 ¿Qué son las semillas?

Las semillas son scripts que insertan datos de ejemplo en la base de datos. Son útiles para:
- **Desarrollo**: Tener datos de prueba sin crearlos manualmente
- **Testing**: Datos consistentes para pruebas
- **Demos**: Presentar el sistema con información realista

## 🚀 Comandos Disponibles

### 1. Reset Completo (RECOMENDADO)
Limpia toda la BD y carga las semillas:
```bash
cd backend
npm run db:reset
```

### 2. Solo Cargar Semillas
Agrega semillas sin borrar datos existentes:
```bash
cd backend
npm run db:seed
```

### 3. Solo Limpiar
Borra todos los datos de la BD:
```bash
cd backend
npm run db:clear
```

## 📊 Semillas Disponibles

### Testimonios (`testimonials.seed.js`)
- **Cantidad**: 12 testimonios
- **Datos incluidos**:
  - Nombre del cliente
  - Empresa
  - Rol/Cargo
  - Testimonio (quote)
  - Calificación (1-5 estrellas)
  - Producto usado
  - Estado (todos aprobados)

**Ejemplo de datos**:
```javascript
{
  name: 'María González',
  company: 'Comercial Luna S.A.',
  role: 'Gerente Financiera',
  quote: 'TaxBridge transformó completamente...',
  rating: 5,
  productUsed: 'Plan Profesional',
  status: 'approved'
}
```

## 🔧 Crear Nuevas Semillas

### 1. Crear archivo de semilla
```bash
backend/src/seeds/nombre.seed.js
```

### 2. Estructura básica
```javascript
const mongoose = require('mongoose');
const Model = require('../models/nombre.model');

// Datos
const data = [
  { campo1: 'valor1', campo2: 'valor2' },
  // ... más datos
];

// Funciones
async function clearNombre() {
  await Model.deleteMany({});
}

async function seedNombre() {
  await Model.insertMany(data);
}

// Exportar
module.exports = { clearNombre, seedNombre };
```

### 3. Registrar en `index.js`
```javascript
// Importar
const { clearNombre, seedNombre } = require('./nombre.seed');

// Agregar a clearDatabase()
await clearNombre();

// Agregar a runAllSeeds()
await seedNombre();
```

## 💡 Tips y Buenas Prácticas

1. **Usa `db:reset` durante desarrollo**: Es la forma más rápida de tener datos frescos
2. **No uses semillas en producción**: Solo para desarrollo/testing
3. **Actualiza las semillas regularmente**: Mantén los datos de ejemplo relevantes
4. **Documenta los datos**: Agrega comentarios explicando qué representa cada dato
5. **Usa datos realistas**: Ayuda a detectar problemas de validación y UX

## 🐛 Solución de Problemas

### Error: Cannot connect to MongoDB
**Solución**: Verifica que MongoDB esté corriendo
```bash
# Windows (si usas MongoDB como servicio)
net start MongoDB

# O inicia MongoDB manualmente
mongod
```

### Error: Collection not found
**Solución**: El modelo no existe o hay un error en el nombre
- Verifica que el modelo esté creado en `backend/src/models/`
- Revisa que el nombre del modelo sea correcto

### Error: Duplicate key
**Solución**: Ya existen datos con el mismo identificador único
```bash
# Usa reset para limpiar y volver a insertar
npm run db:reset
```

## 📁 Estructura de Archivos

```
backend/
├── src/
│   ├── seeds/
│   │   ├── index.js              # Controlador principal
│   │   ├── testimonials.seed.js  # Semilla de testimonios
│   │   └── [otras].seed.js       # Otras semillas futuras
│   └── models/
│       └── testimonial.model.js  # Modelo de testimonios
└── package.json                  # Scripts npm
```

## 🎯 Ejemplo de Uso Completo

```bash
# 1. Navegar al backend
cd backend

# 2. Asegurar que MongoDB está corriendo
net start MongoDB  # Windows

# 3. Limpiar y cargar semillas
npm run db:reset

# 4. Verificar en MongoDB
mongo
use taxbridge
db.testimonials.find().pretty()

# 5. Iniciar el servidor
npm run dev

# 6. Probar el endpoint
curl http://localhost:3000/api/testimonials
```

## 📞 ¿Necesitas Ayuda?

Si tienes problemas con las semillas:
1. Verifica que MongoDB esté corriendo
2. Revisa que las variables de entorno estén configuradas (`.env`)
3. Asegúrate de estar en el directorio correcto (`backend/`)
4. Revisa los logs de error para más detalles
