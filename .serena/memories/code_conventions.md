# Convenciones de Código TaxBridge

## Estilo General
- **Lenguaje**: Español para comentarios y mensajes de usuario
- **Encoding**: UTF-8
- **Nombres**: camelCase para variables/funciones, PascalCase para clases/componentes

## Frontend (Angular/TypeScript)
- **Formato**: Prettier con printWidth: 100, singleQuote: true
- **Imports**: Agrupados por Angular, terceros, locales
- **Componentes**: Un archivo por componente (ts, html, scss)
- **Servicios**: Inyección con `inject()` o constructor
- **Nombres**: PascalCase para componentes, camelCase para servicios

## Backend (Node.js/JavaScript)
- **Formato**: ESLint para linting
- **Estilo**: async/await para operaciones asíncronas
- **Nombres**: camelCase para funciones, PascalCase para clases
- **Errores**: Try/catch con logging apropiado
- **Comentarios**: En español, descriptivos

## Base de Datos
- **Nombres de campos**: camelCase
- **Validaciones**: En modelos Mongoose
- **Relaciones**: Referencias con ObjectId

## Commits y Git
- **Mensajes**: En español, descriptivos
- **Branches**: feature/nombre, bugfix/nombre
- **Commits**: Cambios atómicos

## Testing
- **Backend**: Jest con supertest para API
- **Frontend**: Angular testing utilities
- **Cobertura**: Enfocado en funcionalidades críticas

## Seguridad
- **Passwords**: Hash con bcrypt
- **JWT**: Tokens con expiración
- **Validación**: express-validator en rutas
- **CORS**: Configurado en server.js