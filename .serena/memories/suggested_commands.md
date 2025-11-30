# Comandos Sugeridos para TaxBridge

## Instalación y Configuración
- `npm run install:all` - Instalar dependencias de frontend y backend desde raíz
- `cd backend && npm install` - Instalar solo backend
- `cd frontend/taxbridge-frontend && npm install` - Instalar solo frontend

## Ejecución
- `npm start` - Ejecutar ambos proyectos (backend y frontend) desde raíz
- `npm run dev` - Ejecutar ambos en modo desarrollo
- `npm run start:backend` - Solo backend
- `npm run start:frontend` - Solo frontend

## Backend
- `cd backend && npm run dev` - Servidor backend con nodemon
- `cd backend && npm run db:reset` - Limpiar BD y cargar semillas
- `cd backend && npm run db:seed` - Cargar semillas
- `cd backend && npm run db:clear` - Limpiar BD
- `cd backend && npm test` - Ejecutar tests backend
- `cd backend && npm run lint` - Linting backend
- `cd backend && npm run lint:fix` - Corregir linting

## Frontend
- `cd frontend/taxbridge-frontend && npm start` - Servidor Angular
- `cd frontend/taxbridge-frontend && npm run build` - Build producción
- `cd frontend/taxbridge-frontend && npm test` - Tests frontend

## Utilidades del Sistema (Windows)
- `git status` - Estado del repositorio
- `git add .` - Agregar cambios
- `git commit -m "mensaje"` - Commit
- `git push` - Push
- `dir` - Listar archivos (equivalente ls)
- `cd ruta` - Cambiar directorio
- `findstr "patron" archivo` - Buscar en archivo (equivalente grep)
- `where comando` - Encontrar ejecutables