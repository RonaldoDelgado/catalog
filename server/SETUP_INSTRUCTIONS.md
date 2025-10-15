# 🚀 Instrucciones de Configuración - Sistema de Catálogo

## 📋 Pasos para Configurar y Ejecutar

### 1. **Configurar Variables de Entorno**

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Base de datos (usa la URL que proporcionaste)
DATABASE_URL=postgres://postgres:adminPRDC@localhost:5432/catalog

# Configuración de la aplicación
NODE_ENV=development
PORT=3000

# Seguridad (opcional)
API_KEY=mi_api_key_secreta

# CORS (opcional)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# JWT (para futuras implementaciones)
JWT_SECRET=mi_jwt_secret_super_seguro
JWT_EXPIRES_IN=1d
```

### 2. **Instalar Dependencias**
```bash
npm install --legacy-peer-deps
```

### 3. **Probar Conexión a la Base de Datos**
```bash
npm run db:test
```

### 4. **Generar y Ejecutar Migraciones**
```bash
# Generar migración para las nuevas entidades
npm run migration:generate -- src/migrations/CreateCatalogTables

# Ejecutar migraciones
npm run migration:run
```

### 5. **Iniciar el Servidor**
```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

## 🌐 Endpoints Disponibles

Una vez iniciado el servidor, tendrás acceso a:

- **Health Check**: `GET http://localhost:3000/api/v1/health`
- **Products**: `http://localhost:3000/api/v1/products`
- **List Prices**: `http://localhost:3000/api/v1/list-prices`
- **Price X List**: `http://localhost:3000/api/v1/price-x-list`

## 📊 Estructura de la Base de Datos

### Tabla `products`
- `id` (UUID, PK)
- `title` (VARCHAR 255)
- `code` (VARCHAR 100, UNIQUE)
- `upc_code` (VARCHAR 100, UNIQUE)
- `description` (TEXT)
- `image_url` (VARCHAR 500)
- `dimensions` (JSONB)
- `created_at`, `updated_at`

### Tabla `list_prices`
- `id` (UUID, PK)
- `title` (VARCHAR 255)
- `description` (TEXT)
- `created_at`, `updated_at`

### Tabla `price_x_list`
- `id` (UUID, PK)
- `product_id` (UUID, FK)
- `list_price_id` (UUID, FK)
- `price` (DECIMAL 10,2)
- `created_at`, `updated_at`
- UNIQUE INDEX en (product_id, list_price_id)

## 🧪 Ejemplos de Prueba

### Crear una Lista de Precios
```bash
curl -X POST http://localhost:3000/api/v1/list-prices \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Precios Mayorista",
    "description": "Lista de precios para clientes mayoristas"
  }'
```

### Crear un Producto
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Laptop Gaming ROG",
    "code": "LAP-ROG-001",
    "upcCode": "123456789012",
    "description": "Laptop gaming de alta gama con RTX 4080",
    "imageUrl": "https://example.com/laptop.jpg",
    "dimensions": {
      "length": 35.5,
      "width": 25.2,
      "height": 2.8,
      "weight": 2.4,
      "unit": "cm"
    }
  }'
```

### Asignar Precio a Producto
```bash
curl -X POST http://localhost:3000/api/v1/price-x-list \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid-del-producto",
    "listPriceId": "uuid-de-la-lista",
    "price": 2499.99
  }'
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Servidor en modo desarrollo
npm run format            # Formatear código
npm run lint              # Ejecutar linter

# Base de datos
npm run db:test           # Probar conexión
npm run migration:generate # Generar migración
npm run migration:run     # Ejecutar migraciones
npm run migration:revert  # Revertir migración

# Producción
npm run build            # Construir aplicación
npm run start:prod       # Servidor en modo producción

# Testing
npm run test            # Ejecutar tests
npm run test:e2e        # Tests end-to-end
```

## 🛡️ Características de Seguridad

- **Validación Global**: Todos los DTOs son validados automáticamente
- **API Key**: Opcional, configurable via `API_KEY` en .env
- **CORS**: Configurado para orígenes específicos
- **Logging**: Todas las requests son loggeadas
- **Error Handling**: Manejo centralizado de errores
- **Response Interceptor**: Respuestas estandarizadas

## 🚀 Despliegue en Railway

1. Conecta tu repositorio a Railway
2. Railway detectará automáticamente que es un proyecto Node.js
3. Configura las variables de entorno en Railway:
   - `DATABASE_URL` (se genera automáticamente con PostgreSQL)
   - `NODE_ENV=production`
   - `PORT=3000`
   - Otras variables según necesites

## 📚 Documentación Adicional

- Ver `API_DOCUMENTATION.md` para documentación completa de endpoints
- Ver `DATABASE_SETUP.md` para detalles de configuración de base de datos

## ❓ Troubleshooting

### Error de conexión a la base de datos
1. Verifica que PostgreSQL esté ejecutándose
2. Confirma las credenciales en el archivo `.env`
3. Ejecuta `npm run db:test` para probar la conexión

### Errores de migración
1. Asegúrate de que la base de datos existe
2. Verifica que no hay migraciones pendientes: `npm run migration:run`
3. Si hay conflictos, revierte la última migración: `npm run migration:revert`

### Puerto en uso
Si el puerto 3000 está ocupado, cambia `PORT=3001` en tu archivo `.env`
