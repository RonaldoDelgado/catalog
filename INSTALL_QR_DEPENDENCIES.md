# Instalación de Dependencias para QR Codes

## 📦 Dependencias Necesarias

Para habilitar la funcionalidad de descarga de códigos QR, necesitas instalar las siguientes dependencias:

### Ejecuta este comando en la carpeta `client`:

```bash
cd client
npm install jszip file-saver qrcode @types/qrcode @types/file-saver
```

## 📝 Descripción de las Dependencias

- **`jszip`**: Librería para crear archivos ZIP en el navegador
- **`file-saver`**: Librería para descargar archivos desde el navegador
- **`qrcode`**: Librería para generar códigos QR
- **`@types/qrcode`**: Tipos de TypeScript para qrcode
- **`@types/file-saver`**: Tipos de TypeScript para file-saver

## ✅ Verificación

Después de instalar las dependencias, verifica que se hayan agregado correctamente en el archivo `package.json`:

```json
{
  "dependencies": {
    "jszip": "^3.x.x",
    "file-saver": "^2.x.x",
    "qrcode": "^1.x.x"
  },
  "devDependencies": {
    "@types/qrcode": "^1.x.x",
    "@types/file-saver": "^2.x.x"
  }
}
```

## 🚀 Uso

Una vez instaladas las dependencias:

1. **Reinicia el servidor de desarrollo** si está corriendo
2. **Navega al Admin Panel** → **Products**
3. **Haz clic en el botón "Download QR Codes"** (botón morado)
4. **Confirma la descarga** en el diálogo
5. **Espera** a que se generen todas las imágenes QR
6. **El archivo ZIP se descargará automáticamente**

## 📋 Formato de las Imágenes

Cada imagen QR contendrá (en una sola columna, centrado):

1. **Nombre del producto** (arriba)
2. **Código QR** (centro)
3. **Código UPC** (abajo)

El nombre del archivo será el código UPC del producto (ej: `11231234.png`)

## 🔧 Troubleshooting

Si encuentras errores después de instalar:

1. **Limpia la caché de npm**:
   ```bash
   npm cache clean --force
   ```

2. **Elimina node_modules y reinstala**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Reinicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
