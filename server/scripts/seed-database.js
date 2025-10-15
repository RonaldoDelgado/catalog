const { Client } = require('pg');
require('dotenv').config();

const sampleData = {
  listPrices: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Precios Mayorista',
      description: 'Lista de precios para clientes mayoristas con descuentos especiales',
      is_active: true
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002', 
      title: 'Precios Retail',
      description: 'Lista de precios para venta al público general',
      is_active: false
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Precios VIP',
      description: 'Lista de precios especiales para clientes VIP',
      is_active: false
    }
  ],
  products: [
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      title: 'Laptop Gaming ROG Strix',
      code: 'LAP-ROG-001',
      upc_code: '123456789012',
      description: 'Laptop gaming de alta gama con procesador Intel i7 y RTX 4080',
      image_url: 'https://picsum.photos/400/300?random=1',
      dimensions: JSON.stringify({
        length: 35.5,
        width: 25.2,
        height: 2.8,
        weight: 2.4,
        unit: 'cm'
      })
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440002',
      title: 'Mouse Gaming Logitech G502',
      code: 'MOU-LOG-502',
      upc_code: '123456789013',
      description: 'Mouse gaming con sensor HERO 25K y 11 botones programables',
      image_url: 'https://picsum.photos/400/300?random=2',
      dimensions: JSON.stringify({
        length: 13.2,
        width: 7.5,
        height: 4.0,
        weight: 0.121,
        unit: 'cm'
      })
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440003',
      title: 'Teclado Mecánico Corsair K95',
      code: 'TEC-COR-K95',
      upc_code: '123456789014',
      description: 'Teclado mecánico RGB con switches Cherry MX y teclas macro',
      image_url: 'https://picsum.photos/400/300?random=3',
      dimensions: JSON.stringify({
        length: 46.5,
        width: 17.1,
        height: 3.8,
        weight: 1.2,
        unit: 'cm'
      })
    }
  ],
  priceXList: [
    // Laptop prices
    { product_id: '660e8400-e29b-41d4-a716-446655440001', list_price_id: '550e8400-e29b-41d4-a716-446655440001', price: 2299.99 }, // Mayorista
    { product_id: '660e8400-e29b-41d4-a716-446655440001', list_price_id: '550e8400-e29b-41d4-a716-446655440002', price: 2499.99 }, // Retail
    { product_id: '660e8400-e29b-41d4-a716-446655440001', list_price_id: '550e8400-e29b-41d4-a716-446655440003', price: 2199.99 }, // VIP
    
    // Mouse prices
    { product_id: '660e8400-e29b-41d4-a716-446655440002', list_price_id: '550e8400-e29b-41d4-a716-446655440001', price: 79.99 },   // Mayorista
    { product_id: '660e8400-e29b-41d4-a716-446655440002', list_price_id: '550e8400-e29b-41d4-a716-446655440002', price: 89.99 },   // Retail
    { product_id: '660e8400-e29b-41d4-a716-446655440002', list_price_id: '550e8400-e29b-41d4-a716-446655440003', price: 74.99 },   // VIP
    
    // Keyboard prices
    { product_id: '660e8400-e29b-41d4-a716-446655440003', list_price_id: '550e8400-e29b-41d4-a716-446655440001', price: 179.99 },  // Mayorista
    { product_id: '660e8400-e29b-41d4-a716-446655440003', list_price_id: '550e8400-e29b-41d4-a716-446655440002', price: 199.99 },  // Retail
    { product_id: '660e8400-e29b-41d4-a716-446655440003', list_price_id: '550e8400-e29b-41d4-a716-446655440003', price: 169.99 }   // VIP
  ]
};

async function seedDatabase() {
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

    // Insert List Prices
    console.log('📊 Insertando listas de precios...');
    for (const listPrice of sampleData.listPrices) {
      await client.query(`
        INSERT INTO list_prices (id, title, description, "isActive", created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [listPrice.id, listPrice.title, listPrice.description, listPrice.is_active]);
    }

    // Insert Products
    console.log('📦 Insertando productos...');
    for (const product of sampleData.products) {
      await client.query(`
        INSERT INTO products (id, title, code, upc_code, description, image_url, dimensions, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (code) DO UPDATE SET
          image_url = EXCLUDED.image_url,
          updated_at = NOW()
      `, [
        product.id,
        product.title,
        product.code,
        product.upc_code,
        product.description,
        product.image_url,
        product.dimensions
      ]);
    }

    // Insert Price X List
    console.log('💰 Insertando precios...');
    for (const price of sampleData.priceXList) {
      await client.query(`
        INSERT INTO price_x_list (id, product_id, list_price_id, price, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
        ON CONFLICT (product_id, list_price_id) DO NOTHING
      `, [price.product_id, price.list_price_id, price.price]);
    }

    console.log('✅ Base de datos poblada exitosamente!');
    console.log('');
    console.log('📊 Datos insertados:');
    console.log(`   - ${sampleData.listPrices.length} listas de precios`);
    console.log(`   - ${sampleData.products.length} productos`);
    console.log(`   - ${sampleData.priceXList.length} precios asignados`);
    console.log('');
    console.log('🌐 Puedes probar los endpoints en:');
    console.log('   - GET http://localhost:3000/api/v1/products');
    console.log('   - GET http://localhost:3000/api/v1/list-prices');
    console.log('   - GET http://localhost:3000/api/v1/price-x-list');

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

seedDatabase();
