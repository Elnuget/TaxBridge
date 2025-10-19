# TaxBridge - Sistema de Gestión Tributaria

Sistema integral para la gestión tributaria desarrollado con Angular (Frontend) y Node.js/Express (Backend).

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- MongoDB (v6 o superior)
- Angular CLI (v20 o superior)

## 🚀 Instalación Rápida

### Desde la raíz del proyecto:

```bash
# Instalar dependencias de ambos proyectos
npm run install:all

# O instalar dependencias individualmente:
cd backend
npm install

cd ../frontend/taxbridge-frontend
npm install
```

## 🏃‍♂️ Ejecución

### Ejecutar ambos proyectos simultáneamente (Recomendado)

```bash
# Desde la raíz del proyecto
npm install
npm start
```

Esto iniciará:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:4200

### Ejecutar proyectos por separado

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend/taxbridge-frontend
npm start
```

## 📁 Estructura del Proyecto

```
TaxBridge/
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── server.js     # Punto de entrada
│   │   ├── config/       # Configuraciones
│   │   ├── controllers/  # Controladores
│   │   ├── middleware/   # Middlewares
│   │   ├── models/       # Modelos de datos
│   │   ├── routes/       # Rutas de la API
│   │   └── utils/        # Utilidades
│   └── package.json
│
└── frontend/
    └── taxbridge-frontend/  # Aplicación Angular
        ├── src/
        │   ├── app/
        │   │   ├── auth/      # Autenticación
        │   │   ├── layout/    # Componentes de layout
        │   │   ├── pages/     # Páginas
        │   │   └── services/  # Servicios
        │   └── index.html
        └── package.json
```

## 🔧 Scripts Disponibles

### Desde la raíz:
- `npm run install:all` - Instala dependencias de frontend y backend
- `npm start` o `npm run dev` - Ejecuta ambos proyectos
- `npm run start:backend` - Solo backend
- `npm run start:frontend` - Solo frontend
- `npm run build:frontend` - Construye el frontend para producción

### Backend:
- `npm start` - Ejecuta el servidor (producción)
- `npm run dev` - Ejecuta con nodemon (desarrollo)
- `npm test` - Ejecuta tests

### Frontend:
- `npm start` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm test` - Ejecuta tests

## 🔒 Configuración del Backend

1. Copia el archivo `.env.example` a `.env` en la carpeta `backend/`
2. Configura las variables de entorno según tu entorno

## 🌐 URLs por defecto

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **API Status**: http://localhost:3000/

## 🐛 Solución de Problemas

### El frontend no se conecta al backend
- Verifica que el backend esté corriendo en el puerto 3000
- Revisa la configuración de CORS en `backend/src/server.js`
- Verifica la URL de la API en `frontend/taxbridge-frontend/src/app/services/api.ts`

### Error de conexión a MongoDB
- Asegúrate de que MongoDB esté corriendo
- Verifica la cadena de conexión en el archivo `.env`

### Puerto ya en uso
- Backend: Cambia el `PORT` en el archivo `.env`
- Frontend: Usa `ng serve --port 4201` o el puerto que prefieras

## 📝 Notas Importantes

⚠️ **IMPORTANTE**: Este proyecto actualmente se enfoca en el **desarrollo del frontend/carcasa**. 

- Solo se trabaja en la maquetación y componentes visuales
- NO es necesario que las funcionalidades estén conectadas al backend
- El objetivo es una **maqueta funcional** para presentar al cliente
- Enfoque en diseño y componentes, no en lógica de negocio

## 👥 Equipo

TaxBridge Team

## 📄 Licencia

ISC
