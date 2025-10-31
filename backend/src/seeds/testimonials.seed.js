const mongoose = require('mongoose');
const Testimonial = require('../models/testimonial.model');
require('dotenv').config();

// Datos de semilla para testimonios
const testimonialsData = [
  {
    name: 'María González',
    company: 'Comercial Luna S.A.',
    role: 'Gerente Financiera',
    quote: 'TaxBridge transformó completamente nuestra gestión tributaria. Antes pasábamos días haciendo declaraciones, ahora todo es automático y sin errores. Una inversión que se paga sola.',
    rating: 5,
    productUsed: 'Plan Profesional',
    status: 'approved'
  },
  {
    name: 'Carlos Mendoza',
    company: 'Tech Solutions EC',
    role: 'CEO',
    quote: 'La integración con el SRI es perfecta. Ya no tengo que preocuparme por fechas límite ni multas. El sistema me notifica todo a tiempo y genera los reportes automáticamente.',
    rating: 5,
    productUsed: 'Plan Empresarial',
    status: 'approved'
  },
  {
    name: 'Ana Rodríguez',
    company: 'Boutique Estilo',
    role: 'Propietaria',
    quote: 'Como pequeña empresaria, necesitaba algo simple pero profesional. TaxBridge es exactamente eso. Fácil de usar y con todo lo que necesito para cumplir con el SRI.',
    rating: 5,
    productUsed: 'Plan Básico',
    status: 'approved'
  },
  {
    name: 'Roberto Jiménez',
    company: 'Constructora Jiménez Hnos.',
    role: 'Director General',
    quote: 'El soporte técnico es excepcional. Siempre responden rápido y resuelven cualquier duda. La plataforma es muy intuitiva, mi contador está encantado.',
    rating: 5,
    productUsed: 'Plan Profesional',
    status: 'approved'
  },
  {
    name: 'Laura Vásquez',
    company: 'Café Aroma',
    role: 'Administradora',
    quote: 'Llevo 6 meses usando TaxBridge y no puedo estar más feliz. Los reportes son claros, la facturación electrónica funciona perfecto y ahorro mucho tiempo.',
    rating: 5,
    productUsed: 'Plan Básico',
    status: 'approved'
  },
  {
    name: 'Diego Paredes',
    company: 'Importadora Global',
    role: 'Gerente de Operaciones',
    quote: 'La API de integración nos permitió conectar TaxBridge con nuestro ERP. Ahora todo el proceso tributario está automatizado de principio a fin. Increíble herramienta.',
    rating: 5,
    productUsed: 'API Empresarial',
    status: 'approved'
  },
  {
    name: 'Patricia Morales',
    company: 'Consultora PM',
    role: 'Contadora Independiente',
    quote: 'Recomiendo TaxBridge a todos mis clientes. Es la solución más completa y confiable del mercado ecuatoriano. Mis clientes están felices y yo trabajo más eficientemente.',
    rating: 5,
    productUsed: 'Plan Profesional',
    status: 'approved'
  },
  {
    name: 'Fernando Castro',
    company: 'Restaurante El Sabor',
    role: 'Propietario',
    quote: 'Lo mejor es que puedo revisar todo desde mi celular. Facturas, impuestos, reportes... todo en un solo lugar. Y el precio es muy accesible para pequeños negocios.',
    rating: 4,
    productUsed: 'Plan Básico',
    status: 'approved'
  },
  {
    name: 'Gabriela Rivas',
    company: 'Agencia Creativa 360',
    role: 'Directora Financiera',
    quote: 'La migración de nuestro sistema anterior fue muy fácil. El equipo de TaxBridge nos ayudó en todo el proceso. Ahora tenemos reportes en tiempo real que antes no teníamos.',
    rating: 5,
    productUsed: 'Plan Empresarial',
    status: 'approved'
  },
  {
    name: 'Andrés Salazar',
    company: 'Farmacia San José',
    role: 'Gerente',
    quote: 'Después de usar varios sistemas, TaxBridge es el más completo. La facturación electrónica es rápida, los anexos se generan solos y nunca he tenido problemas con el SRI.',
    rating: 5,
    productUsed: 'Plan Profesional',
    status: 'approved'
  },
  {
    name: 'Verónica Torres',
    company: 'Librería Cultural',
    role: 'Propietaria',
    quote: 'Como no soy experta en contabilidad, necesitaba algo muy simple. TaxBridge es perfecto: automático, seguro y sin complicaciones. Lo recomiendo 100%.',
    rating: 5,
    productUsed: 'Plan Básico',
    status: 'approved'
  },
  {
    name: 'Jorge Maldonado',
    company: 'Distribuidora JM',
    role: 'Gerente Comercial',
    quote: 'El ahorro de tiempo es impresionante. Lo que antes nos tomaba una semana, ahora lo hacemos en un día. Y con la certeza de que todo está correcto y cumple con la ley.',
    rating: 5,
    productUsed: 'Plan Empresarial',
    status: 'approved'
  }
];

// Función para limpiar la colección
async function clearTestimonials() {
  try {
    const result = await Testimonial.deleteMany({});
    console.log(`✅ Se eliminaron ${result.deletedCount} testimonios existentes`);
  } catch (error) {
    console.error('❌ Error al limpiar testimonios:', error);
    throw error;
  }
}

// Función para insertar los testimonios de semilla
async function seedTestimonials() {
  try {
    const testimonials = await Testimonial.insertMany(testimonialsData);
    console.log(`✅ Se insertaron ${testimonials.length} testimonios exitosamente`);
    return testimonials;
  } catch (error) {
    console.error('❌ Error al insertar testimonios:', error);
    throw error;
  }
}

// Función principal
async function runSeed() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taxbridge');
    console.log('📊 Conectado a MongoDB');

    // Ejecutar semilla
    console.log('\n🌱 Iniciando proceso de semilla para testimonios...\n');
    
    await clearTestimonials();
    await seedTestimonials();

    console.log('\n✨ Proceso de semilla completado exitosamente\n');
    
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Error en el proceso de semilla:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runSeed();
}

module.exports = { clearTestimonials, seedTestimonials, runSeed };
