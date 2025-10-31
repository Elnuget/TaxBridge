const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonial.controller');

// Ruta para crear un nuevo testimonio
// POST /api/testimonials
router.post('/', testimonialController.createTestimonial);

// Ruta para obtener todos los testimonios
// GET /api/testimonials
router.get('/', testimonialController.getAllTestimonials);

module.exports = router;

