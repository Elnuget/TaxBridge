const mongoose = require('mongoose');
require('dotenv').config();

// Importar todas las semillas
const { clearTestimonials, seedTestimonials } = require('./testimonials.seed');
const { clearUsers, seedUsers } = require('./users.seed');

// Función para limpiar toda la base de datos
async function clearDatabase() {
  try {
    console.log('\n🗑️  Limpiando base de datos...\n');
    
    await clearTestimonials();
    await clearUsers();
    
    console.log('✅ Base de datos limpiada\n');
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
    throw error;
  }
}

// Función para ejecutar todas las semillas
async function runAllSeeds() {
  try {
    console.log('\n🌱 Ejecutando todas las semillas...\n');
    
    await seedUsers();
    await seedTestimonials();
    
    console.log('✅ Todas las semillas ejecutadas\n');
  } catch (error) {
    console.error('❌ Error al ejecutar las semillas:', error);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taxbridge');
    console.log('📊 Conectado a MongoDB');

    // Obtener argumentos de línea de comandos
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'clear':
        await clearDatabase();
        break;
      
      case 'seed':
        await runAllSeeds();
        break;
      
      case 'reset':
        await clearDatabase();
        await runAllSeeds();
        break;
      
      default:
        console.log('\n📖 Comandos disponibles:');
        console.log('  - clear: Limpia toda la base de datos');
        console.log('  - seed: Ejecuta todas las semillas');
        console.log('  - reset: Limpia y ejecuta las semillas (recomendado)\n');
        console.log('Uso: node src/seeds/index.js [comando]\n');
        break;
    }

    // Cerrar conexión
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { clearDatabase, runAllSeeds };
