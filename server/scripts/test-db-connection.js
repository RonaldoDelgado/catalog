const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  let client;
  
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (databaseUrl) {
      console.log('🔗 Conectando usando DATABASE_URL...');
      client = new Client({
        connectionString: databaseUrl,
      });
    } else {
      console.log('🔗 Conectando usando variables separadas...');
      client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        user: process.env.DATABASE_USERNAME || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'password',
        database: process.env.DATABASE_NAME || 'catalog',
      });
    }

    await client.connect();
    console.log('✅ Conexión exitosa a PostgreSQL!');
    
    const result = await client.query('SELECT version()');
    console.log('📊 Versión de PostgreSQL:', result.rows[0].version);
    
    const dbResult = await client.query('SELECT current_database()');
    console.log('🗄️  Base de datos actual:', dbResult.rows[0].current_database);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

testConnection();
