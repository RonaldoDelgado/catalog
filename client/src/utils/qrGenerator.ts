import QRCode from 'qrcode';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Product } from '@/services/api';

interface QRImageOptions {
  width: number;
  height: number;
  margin: number;
}

/**
 * Genera una imagen con el nombre del producto, QR code y UPC
 */
export async function generateProductQRImage(
  product: Product,
  options: QRImageOptions = { width: 400, height: 600, margin: 40 }
): Promise<Blob> {
  const { width, height, margin } = options;

  // Crear un canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo crear el contexto del canvas');
  }

  // Fondo blanco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Configuración de texto
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';

  let currentY = margin;

  // 1. Nombre del producto (arriba)
  ctx.font = 'bold 24px Arial';
  const titleLines = wrapText(ctx, product.title, width - margin * 2);
  titleLines.forEach((line) => {
    ctx.fillText(line, width / 2, currentY);
    currentY += 32;
  });

  currentY += 20; // Espacio después del título

  // 2. QR Code (centro)
  const qrSize = 250;
  try {
    const qrDataUrl = await QRCode.toDataURL(product.upcCode, {
      width: qrSize,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const qrImage = await loadImage(qrDataUrl);
    const qrX = (width - qrSize) / 2;
    ctx.drawImage(qrImage, qrX, currentY, qrSize, qrSize);
    currentY += qrSize + 30;
  } catch (error) {
    console.error('Error generando QR:', error);
    // Dibujar un placeholder si falla
    ctx.strokeStyle = '#CCCCCC';
    ctx.strokeRect((width - qrSize) / 2, currentY, qrSize, qrSize);
    currentY += qrSize + 30;
  }

  // 3. UPC Code (abajo)
  ctx.font = 'bold 28px Arial';
  ctx.fillText(product.upcCode, width / 2, currentY);

  // Convertir canvas a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('No se pudo generar la imagen'));
      }
    }, 'image/png');
  });
}

/**
 * Genera un archivo ZIP con todas las imágenes QR de los productos
 */
export async function downloadAllProductQRCodes(
  products: Product[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (products.length === 0) {
    alert('No hay productos para descargar');
    return;
  }

  const zip = new JSZip();
  const qrFolder = zip.folder('product-qr-codes');

  if (!qrFolder) {
    throw new Error('No se pudo crear la carpeta en el ZIP');
  }

  // Generar cada imagen QR
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    if (onProgress) {
      onProgress(i + 1, products.length);
    }

    try {
      const imageBlob = await generateProductQRImage(product);
      const fileName = `${sanitizeFileName(product.upcCode)}.png`;
      qrFolder.file(fileName, imageBlob);
    } catch (error) {
      console.error(`Error generando QR para ${product.title}:`, error);
    }
  }

  // Generar y descargar el ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `product-qr-codes-${new Date().getTime()}.zip`);
}

/**
 * Divide el texto en múltiples líneas si es muy largo
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Carga una imagen desde una URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Sanitiza el nombre del archivo
 */
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-z0-9_-]/gi, '_');
}
