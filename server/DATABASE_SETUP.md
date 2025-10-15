# Configuración de Base de Datos - NestJS con PostgreSQL y TypeORM

## Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

### Para Desarrollo
```env
# Database Configuration (Opción 1: URL completa - RECOMENDADO)
DATABASE_URL=postgres://postgres:adminPRDC@localhost:5432/catalog

# Database Configuration (Opción 2: Variables separadas - opcional)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=adminPRDC
DATABASE_NAME=catalog

# Application Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration (opcional)
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=1d
```

### Para Producción (Railway)
```env
# Database Configuration (Railway proporcionará DATABASE_URL automáticamente)
DATABASE_URL=postgres://postgres:password@host:5432/database

# Application Configuration
NODE_ENV=production
PORT=3000

# JWT Configuration
JWT_SECRET=tu_clave_secreta_jwt_produccion
JWT_EXPIRES_IN=1d
```

## Configuración de Conexión

El proyecto soporta dos métodos de configuración de base de datos:

1. **DATABASE_URL (Recomendado)**: Una sola variable con la URL completa de conexión
2. **Variables separadas**: HOST, PORT, USERNAME, PASSWORD, DATABASE por separado

Si se proporciona `DATABASE_URL`, tendrá prioridad sobre las variables separadas.

## Comandos de Migración

### Generar una nueva migración
```bash
npm run migration:generate -- src/migrations/NombreDeLaMigracion
```

### Ejecutar migraciones pendientes
```bash
npm run migration:run
```

### Revertir la última migración
```bash
npm run migration:revert
```

### Crear una migración vacía
```bash
npm run migration:create -- src/migrations/NombreDeLaMigracion
```

## Configuración de PostgreSQL Local

1. Instala PostgreSQL en tu sistema
2. Crea una base de datos para el proyecto:
```sql
CREATE DATABASE nombre_de_tu_base_de_datos;
```
3. Crea un usuario (opcional):
```sql
CREATE USER tu_usuario WITH PASSWORD 'tu_contraseña';
GRANT ALL PRIVILEGES ON DATABASE nombre_de_tu_base_de_datos TO tu_usuario;
```

## Configuración para Railway (Producción)

1. Crea un proyecto en Railway
2. Agrega un servicio PostgreSQL
3. Railway generará automáticamente las variables de entorno de la base de datos
4. Configura las variables de entorno en Railway con los valores de producción

## Estructura del Proyecto

```
src/
├── database/
│   ├── database.config.ts    # Configuración de TypeORM para NestJS
│   └── data-source.ts        # DataSource para migraciones
├── entities/                 # Entidades de TypeORM
│   └── user.entity.ts        # Ejemplo de entidad
├── migrations/               # Archivos de migración
└── ...
```

## Comandos Útiles

### Desarrollo
```bash
npm run start:dev          # Iniciar en modo desarrollo
npm run migration:run      # Ejecutar migraciones
```

### Producción
```bash
npm run build             # Construir el proyecto
npm run start:prod        # Iniciar en modo producción
```
