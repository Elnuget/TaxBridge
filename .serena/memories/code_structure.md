# Estructura del Código TaxBridge

## Arquitectura General
```
TaxBridge/
├── backend/              # API REST Node.js/Express
├── frontend/taxbridge-frontend/  # SPA Angular
└── .github/instructions/ # Instrucciones del proyecto
```

## Backend (Node.js/Express)
```
backend/src/
├── server.js           # Punto de entrada
├── config/
│   └── database.js     # Conexión MongoDB
├── controllers/        # Lógica de negocio
│   ├── auth.controller.js
│   ├── customer.controller.js
│   └── testimonial.controller.js
├── middleware/
│   └── auth.js         # Autenticación JWT
├── models/             # Esquemas Mongoose
│   ├── User.js
│   ├── Customer.js
│   └── testimonial.model.js
├── routes/             # Definición de rutas API
├── seeds/              # Datos de prueba
└── utils/              # Utilidades
```

## Frontend (Angular)
```
frontend/taxbridge-frontend/src/app/
├── auth/               # Autenticación
│   ├── login/
│   └── auth/           # Componente auth
├── layout/             # Componentes de layout
│   ├── header/
│   ├── footer/
│   ├── navbar-shop/
│   └── sidebar/
├── pages/              # Páginas principales
│   ├── admin-dashboard/
│   ├── customer-dashboard/
│   ├── contador-dashboard/
│   ├── checkout/
│   ├── testimonials/
│   └── welcome/
├── services/           # Servicios inyectables
│   ├── auth.service.ts
│   ├── api.ts
│   └── cart.service.ts
└── guards/             # Guards de ruta
    └── auth.guard.ts
```

## Patrones de Diseño
- **MVC** en backend (Model-View-Controller)
- **Component-based** en frontend con Angular
- **Dependency Injection** para servicios
- **JWT** para autenticación
- **Mongoose** para modelado de datos MongoDB