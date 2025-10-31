const mongoose = require('mongoose');

// Este es el esquema para la colección de Testimonios (Reseñas)
const testimonialSchema = new mongoose.Schema({

    // --- Campos de quién escribe la reseña ---

    // Nombre de la persona (ej. "Richard Soria")
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
    },

    // Empresa (ej. "Mi Cafetería Ejemplo")
    company: {
        type: String,
        trim: true,
        default: 'Cliente' // Si no especifican, se pone 'Cliente'
    },

    // Rol (ej. "Dueño" o "Contador")
    role: {
        type: String,
        trim: true,
        default: 'Usuario' // Si no especifican, se pone 'Usuario'
    },
    
    // --- Campos de la reseña en sí ---

    // El testimonio (ej. "Me ahorró 15 horas...")
    quote: {
        type: String,
        required: [true, 'La reseña (quote) es requerida'],
        trim: true,
        maxlength: [1000, 'La reseña no puede exceder 1000 caracteres']
    },

    // Calificación (ej. 5)
    rating: {
        type: Number,
        required: [true, 'La calificación (rating) es requerida'],
        min: 1, // Calificación mínima de 1
        max: 5  // Calificación máxima de 5
    },

    // Producto que usó (ej. "Anexo ATS")
    productUsed: {
        type: String,
        required: [true, 'El producto/servicio es requerido'],
        trim: true
    },

    // --- Campo de Control (MUY IMPORTANTE) ---

    // Estado de la reseña, para aprobación del admin
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'], // Solo puede ser uno de estos 3
        default: 'pending' // Todas las reseñas nuevas entran como "pendientes"
    }
}, {
    // Añade automáticamente 'createdAt' y 'updatedAt'
    timestamps: true
});

// Nota: No necesitamos 'bcrypt' ni métodos de contraseña aquí, 
// porque este modelo no es para iniciar sesión.

module.exports = mongoose.model('Testimonial', testimonialSchema);
