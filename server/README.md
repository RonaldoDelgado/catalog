# 🛍️ Sistema de Catálogo - API REST

Sistema completo de gestión de catálogo de productos desarrollado con **NestJS**, **PostgreSQL** y **TypeORM**.

## ✨ Características Principales

- 🏗️ **Arquitectura Modular**: Módulos separados para Products, ListPrices y PriceXList
- 🔒 **Seguridad**: Validación global, API Key opcional, CORS configurado
- 🗄️ **Base de Datos**: PostgreSQL con migraciones automáticas
- 📊 **CRUD Completo**: Operaciones completas para todas las entidades
- 🔍 **Búsqueda**: Funcionalidad de búsqueda en productos y listas
- 📝 **Validación**: DTOs con class-validator para entrada de datos
- 🚀 **Producción**: Configurado para despliegue en Railway

## 🏛️ Arquitectura de Entidades

### Product (Productos)
- ID único, título, código, código UPC
- Descripción, imagen, dimensiones (JSON)
- Relación uno-a-muchos con precios

### ListPrice (Listas de Precios)  
- ID único, título, descripción
- Relación uno-a-muchos con precios

### PriceXList (Precios por Lista)
- Tabla intermedia para manejar precios variables
- Un producto puede tener diferentes precios según la lista
- Restricción única por producto-lista

## 🚀 Inicio Rápido

1. **Configurar entorno**:
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales
   ```

2. **Instalar dependencias**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configurar base de datos**:
   ```bash
   npm run db:test                    # Probar conexión
   npm run migration:generate -- src/migrations/CreateCatalogTables
   npm run migration:run              # Crear tablas
   npm run db:seed                    # Poblar con datos de ejemplo
   ```

4. **Iniciar servidor**:
   ```bash
   npm run start:dev
   ```

## 📚 Documentación

- **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** - Guía completa de configuración
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Documentación de endpoints
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Configuración de base de datos

## 🌐 Endpoints Principales

```bash
GET    /api/v1/health              # Estado de la API
GET    /api/v1/products            # Listar productos
POST   /api/v1/products            # Crear producto
GET    /api/v1/list-prices         # Listar listas de precios
POST   /api/v1/list-prices         # Crear lista
GET    /api/v1/price-x-list        # Listar precios
POST   /api/v1/price-x-list        # Asignar precio
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
