---
applyTo: '**'
---
## Contexto del Proyecto TaxBridge

**IMPORTANTE**: Este proyecto se enfoca en el desarrollo del **frontend/carcasa** con integración funcional al backend:

### Frontend (Prioridad Principal)
- Maquetación y componentes visuales completos
- Diseño responsive y profesional
- Enfoque en UX/UI para presentar al cliente

### Backend (Integración Funcional)
- **SÍ se usa**: Para crear clientes en la base de datos con sus compras
- **SÍ se usa**: Sistema de cuentas automático con contraseñas temporales
- **SÍ se usa**: Para el proceso de checkout y creación de clientes
- **SÍ se usa**: Dashboard personalizado mostrando productos comprados del cliente
- **NO se usa aún**: Sistema de login completo (en desarrollo)
- **NO se usa**: Funcionalidades complejas de backend

### Sistema de Cuentas Automático
1. Al completar una compra, se crea automáticamente una cuenta de cliente
2. El sistema genera:
   - Número de cliente único (TB-000001, TB-000002, etc.)
   - Contraseña temporal aleatoria (8 caracteres)
3. Las credenciales se muestran al cliente después de la compra
4. El cliente puede iniciar sesión con su email y contraseña temporal
5. Se recomienda cambiar la contraseña después del primer login

### Flujo de Compra
1. Usuario completa checkout **sin necesidad de registro previo**
2. Se crea automáticamente un cliente en la BD con:
   - Número de cliente único generado (TB-XXXXXX)
   - Email y contraseña temporal
   - Información personal completa
   - Productos comprados con detalles
3. Se muestran las credenciales al cliente (email + contraseña temporal)
4. Usuario es redirigido al dashboard con sus productos comprados
5. Dashboard muestra:
   - Información del cliente
   - Todos los productos adquiridos
   - Totales de compra
   - Método de pago utilizado

### Persistencia de Datos
- Todos los clientes se guardan en MongoDB
- Cada producto comprado se registra con cantidad, precio y categoría
- Los datos persisten entre sesiones
- El cliente puede acceder a su dashboard mediante su número de cliente

El objetivo es una **maqueta funcional realista** que demuestre:
- Flujo completo de compra con persistencia real de datos
- Sistema de cuentas automático sin registro manual
- Dashboard personalizado por cliente
- Experiencia de usuario profesional y completa

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.