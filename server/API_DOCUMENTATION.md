# API Documentation - Catálogo de Productos

## Base URL
```
http://localhost:3000/api/v1
```

## Endpoints

### Health Check
```http
GET /health
```
Verifica el estado de la API.

### Products

#### Crear Producto
```http
POST /products
Content-Type: application/json

{
  "title": "Producto de ejemplo",
  "code": "PROD001",
  "upcCode": "123456789012",
  "description": "Descripción del producto",
  "imageUrl": "https://example.com/image.jpg",
  "dimensions": {
    "length": 10.5,
    "width": 5.2,
    "height": 3.1,
    "weight": 0.5,
    "unit": "cm"
  }
}
```

#### Obtener Todos los Productos
```http
GET /products
GET /products?search=texto_busqueda
```

#### Obtener Producto por ID
```http
GET /products/{id}
```

#### Obtener Producto por Código
```http
GET /products/code/{code}
```

#### Obtener Producto por UPC
```http
GET /products/upc/{upcCode}
```

#### Actualizar Producto
```http
PATCH /products/{id}
Content-Type: application/json

{
  "title": "Nuevo título",
  "description": "Nueva descripción"
}
```

#### Eliminar Producto
```http
DELETE /products/{id}
```

### List Prices (Listas de Precios)

#### Crear Lista de Precios
```http
POST /list-prices
Content-Type: application/json

{
  "title": "Lista Mayorista",
  "description": "Precios para clientes mayoristas"
}
```

#### Obtener Todas las Listas
```http
GET /list-prices
GET /list-prices?search=texto_busqueda
```

#### Obtener Lista por ID
```http
GET /list-prices/{id}
```

#### Actualizar Lista
```http
PATCH /list-prices/{id}
Content-Type: application/json

{
  "title": "Nuevo nombre de lista"
}
```

#### Eliminar Lista
```http
DELETE /list-prices/{id}
```

### Price X List (Precios por Lista)

#### Asignar Precio a Producto en Lista
```http
POST /price-x-list
Content-Type: application/json

{
  "productId": "uuid-del-producto",
  "listPriceId": "uuid-de-la-lista",
  "price": 99.99
}
```

#### Obtener Todos los Precios
```http
GET /price-x-list
```

#### Obtener Precios por Producto
```http
GET /price-x-list/product/{productId}
```

#### Obtener Precios por Lista
```http
GET /price-x-list/list-price/{listPriceId}
```

#### Obtener Precio Específico
```http
GET /price-x-list/product/{productId}/list-price/{listPriceId}
```

#### Obtener Precio por ID
```http
GET /price-x-list/{id}
```

#### Actualizar Precio
```http
PATCH /price-x-list/{id}
Content-Type: application/json

{
  "price": 89.99
}
```

#### Eliminar Precio
```http
DELETE /price-x-list/{id}
```

## Respuesta Estándar

Todas las respuestas exitosas siguen este formato:

```json
{
  "data": { /* datos de respuesta */ },
  "message": "Success",
  "statusCode": 200,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Códigos de Error

- `400` - Bad Request: Datos inválidos
- `401` - Unauthorized: API key inválida (si está configurada)
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto de datos únicos (código, UPC, etc.)
- `500` - Internal Server Error: Error del servidor

## Seguridad

### API Key (Opcional)
Si está configurada la variable `API_KEY`, incluir en headers:
```
x-api-key: tu_api_key
```

### CORS
Configurado para permitir orígenes específicos definidos en `CORS_ORIGIN`.

## Validaciones

### Product
- `title`: Requerido, máximo 255 caracteres
- `code`: Requerido, único, máximo 100 caracteres
- `upcCode`: Requerido, único, máximo 100 caracteres
- `description`: Opcional, texto
- `imageUrl`: Opcional, URL válida, máximo 500 caracteres
- `dimensions`: Opcional, objeto con propiedades numéricas

### ListPrice
- `title`: Requerido, máximo 255 caracteres
- `description`: Opcional, texto

### PriceXList
- `productId`: Requerido, UUID válido
- `listPriceId`: Requerido, UUID válido
- `price`: Requerido, número positivo con máximo 2 decimales

## Ejemplos de Uso

### Crear un catálogo completo

1. **Crear una lista de precios:**
```bash
curl -X POST http://localhost:3000/api/v1/list-prices \
  -H "Content-Type: application/json" \
  -d '{"title": "Precios Retail", "description": "Precios para venta al público"}'
```

2. **Crear un producto:**
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Laptop Gaming",
    "code": "LAP001",
    "upcCode": "123456789012",
    "description": "Laptop para gaming de alta gama",
    "dimensions": {"length": 35, "width": 25, "height": 3, "weight": 2.5, "unit": "cm"}
  }'
```

3. **Asignar precio al producto:**
```bash
curl -X POST http://localhost:3000/api/v1/price-x-list \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid-del-producto",
    "listPriceId": "uuid-de-la-lista",
    "price": 1299.99
  }'
```
