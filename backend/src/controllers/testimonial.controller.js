// Importamos el modelo que define la estructura
const Testimonial = require('../models/testimonial.model.js');

// --- Funciones del Controlador ---
exports.createTestimonial = async (req, res) => {
    try {
        // Obtenemos los datos del formulario (body)
        const { name, company, role, quote, rating, productUsed } = req.body;

        // Creamos el nuevo testimonio
        // Se guarda como 'approved' (aprobado) inmediatamente
        const newTestimonial = new Testimonial({
            name,
            company,
            role,
            quote,
            rating,
            productUsed,
            status: 'approved'
        });

        // Guardamos en la base de datos
        const savedTestimonial = await newTestimonial.save();

        // Respondemos al frontend
        res.status(201).json({
            success: true,
            data: savedTestimonial,
            message: '¡Gracias por tu reseña! Ha sido publicada.'
        });

    } catch (error) {
        // Manejo de errores (ej. campos requeridos faltantes)
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getAllTestimonials = async (req, res) => {
    try {
        // Buscamos en la BD todos los testimonios (sin filtro de status)
        const testimonials = await Testimonial.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: testimonials.length,
            data: testimonials
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error de servidor: ' + error.message
        });
    }
};
