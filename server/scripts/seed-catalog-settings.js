const { Client } = require('pg');
require('dotenv').config();

const initialSettings = [
  {
    key: 'catalog_visible',
    value: 'true',
    description: 'Controls whether the product catalog is visible to users'
  },
  {
    key: 'catalog_title',
    value: 'Product Catalog',
    description: 'Title displayed in the catalog header'
  },
  {
    key: 'catalog_description',
    value: 'Browse our complete product catalog',
    description: 'Description displayed in the catalog'
  }
];

async function seedCatalogSettings() {
  let client;
  
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (databaseUrl) {
      client = new Client({ connectionString: databaseUrl });
    } else {
      client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        user: process.env.DATABASE_USERNAME || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'password',
        database: process.env.DATABASE_NAME || 'catalog',
      });
    }

    await client.connect();
    console.log('🔗 Conectado a la base de datos');

    console.log('⚙️ Insertando configuraciones del catálogo...');
    for (const setting of initialSettings) {
      await client.query(`
        INSERT INTO catalog_settings (id, key, value, description, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          description = EXCLUDED.description,
          updated_at = NOW()
      `, [setting.key, setting.value, setting.description]);
    }

    console.log('✅ Configuraciones del catálogo insertadas exitosamente!');
    console.log('');
    console.log('📊 Configuraciones creadas:');
    initialSettings.forEach(setting => {
      console.log(`   - ${setting.key}: ${setting.value}`);
    });

  } catch (error) {
    console.error('❌ Error poblando configuraciones:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

seedCatalogSettings();
