# 🚀 Configuración del Frontend - Sistema de Catálogo

## 📋 Pasos para Configurar el Cliente

### 1. **Variables de Entorno**

Crea un archivo `.env.local` en la raíz del proyecto cliente con:

```env
# URL del backend API (ajusta el puerto según tu configuración del servidor)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Configuración de desarrollo
NODE_ENV=development
```

**Nota**: El servidor backend debe estar ejecutándose en el puerto 3001 (o el que hayas configurado).

### 2. **Instalar Dependencias**

```bash
npm install
```

### 3. **Iniciar el Cliente**

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm run start
```

## 🔧 Configuración Completada

### **✅ Servicios de API Integrados**
- **ApiClient con Axios**: Comunicación centralizada con el backend
- **Manejo de errores**: Try-catch y mensajes de error
- **Interceptores**: Respuestas estandarizadas del backend
- **Tipos TypeScript**: Interfaces para Product, ListPrice, PriceXList

### **✅ Componentes Actualizados**

#### **ProductCatalog**
- ✅ Conectado a API real para obtener productos
- ✅ Búsqueda en tiempo real usando endpoints del backend
- ✅ Precios dinámicos según lista activa
- ✅ Estados de carga y error
- ✅ Escaneo QR integrado con búsqueda API

#### **AdminPanel**
- ✅ Gestión de listas de precios activas
- ✅ Control de visibilidad del catálogo
- ✅ Navegación entre secciones de administración

#### **PriceListManager**
- ✅ CRUD completo de listas de precios
- ✅ Validación y manejo de errores async
- ✅ Estados de carga en formularios
- ✅ Indicador visual de lista activa

#### **AdminLogin**
- ✅ Autenticación simple con contraseña
- ✅ Integrado con ApiContext

### **🔗 Contexto de API (ApiProvider)**
- ✅ Reemplaza el contexto anterior
- ✅ Manejo centralizado del estado de la aplicación
- ✅ Operaciones CRUD para todas las entidades
- ✅ Estados de carga y error globales

## 🌐 URLs y Endpoints

### **Frontend**
- **Desarrollo**: `http://localhost:3000`
- **Catálogo**: `http://localhost:3000` (vista pública)
- **Admin**: Click en "Admin" → Login → Panel de administración

### **Backend API**
- **Base URL**: `http://localhost:3001/api/v1`
- **Health Check**: `GET /health`
- **Products**: `GET/POST/PATCH/DELETE /products`
- **List Prices**: `GET/POST/PATCH/DELETE /list-prices`
- **Price X List**: `GET/POST/PATCH/DELETE /price-x-list`

## 🔐 Credenciales de Admin

**Contraseña de administrador**: `Pasword2026*-`

## 🚨 Troubleshooting

### **Error de conexión con el backend**
1. Verifica que el servidor backend esté ejecutándose en el puerto correcto
2. Confirma que la URL en `NEXT_PUBLIC_API_URL` sea correcta
3. Revisa la consola del navegador para errores de CORS

### **Datos no se cargan**
1. Verifica que el backend tenga datos (usa `npm run db:seed` en el servidor)
2. Revisa la consola del navegador para errores de API
3. Confirma que las migraciones del backend se hayan ejecutado

### **Error de tipos TypeScript**
1. Los tipos están definidos en `src/services/api.ts`
2. Asegúrate de que coincidan con las entidades del backend
3. Ejecuta `npm run build` para verificar errores de tipos

## 📱 Funcionalidades Disponibles

### **Vista Pública (Catálogo)**
- ✅ Visualización de productos con precios
- ✅ Búsqueda por título, código o UPC
- ✅ Escaneo de códigos QR
- ✅ Filtrado según lista de precios activa
- ✅ Información de dimensiones de productos

### **Panel de Administración**
- ✅ Gestión completa de listas de precios
- ✅ Control de visibilidad del catálogo
- ✅ Selección de lista de precios activa
- ✅ Navegación entre módulos

### **Gestión de Listas de Precios**
- ✅ Crear nuevas listas
- ✅ Editar listas existentes
- ✅ Eliminar listas
- ✅ Marcar lista como activa
- ✅ Validación de formularios

## 🔄 Flujo de Datos

1. **Carga inicial**: ApiProvider carga datos del backend
2. **Búsqueda**: Componentes llaman a funciones de búsqueda API
3. **CRUD**: Operaciones actualizan estado local y backend
4. **Estados**: Loading, error y success manejados globalmente
5. **Sincronización**: Cambios se reflejan inmediatamente en la UI

## 🎯 Próximas Características

- [ ] ProductManager completo con gestión de precios
- [ ] Asignación de precios por producto y lista
- [ ] Validaciones avanzadas
- [ ] Carga de imágenes
- [ ] Exportación de datos
- [ ] Filtros avanzados
