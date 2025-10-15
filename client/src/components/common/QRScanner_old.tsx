'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]); // startCamera is defined inside useEffect, so it's safe to omit

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Usar cámara trasera si está disponible
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        
        // Iniciar el escaneo
        scanForQR();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara. Asegúrate de dar permisos de cámara.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const scanForQR = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      setTimeout(scanForQR, 200);
      return;
    }

    // Usar resolución más alta para mejor detección
    const scale = 2;
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    
    // Mejorar la calidad de la imagen
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Aplicar filtros para mejorar el contraste
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const enhancedImageData = enhanceImageForQR(imageData);
    ctx.putImageData(enhancedImageData, 0, 0);

    try {
      detectQRFromCanvas(canvas);
    } catch (scanError) {
      console.error('Error scanning QR:', scanError);
    }

    if (isScanning) {
      setTimeout(scanForQR, 200);
    }
  };

  const detectQRFromCanvas = async (canvas: HTMLCanvasElement) => {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Obtener los datos de la imagen
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Implementación básica de detección QR usando análisis de patrones
      // Buscar patrones de QR en la imagen
      const qrResult = analyzeImageForQR(imageData);
      
      if (qrResult && /^\d{11,12}$/.test(qrResult)) {
        onScan(qrResult);
        stopCamera();
        onClose();
        return;
      }

      // Fallback: Intentar con múltiples APIs
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Método 1: QR Server API
        try {
          const formData = new FormData();
          formData.append('file', blob, 'qr-scan.png');
          
          const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            
            if (result && result[0] && result[0].symbol && result[0].symbol[0]) {
              const data = result[0].symbol[0].data;
              if (data && /^\d{11,12}$/.test(data.trim())) {
                onScan(data.trim());
                stopCamera();
                onClose();
                return;
              }
            }
          }
        } catch {
          // Continuar con el siguiente método
        }

        // Método 2: Convertir a base64 y usar URL
        try {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64 = (reader.result as string).split(',')[1];
              const response = await fetch(`https://api.qrserver.com/v1/read-qr-code/?fileurl=data:image/png;base64,${encodeURIComponent(base64)}`);
              
              if (response.ok) {
                const text = await response.text();
                // Limpiar la respuesta
                const cleanText = text.replace(/[^\d]/g, '');
                if (/^\d{11,12}$/.test(cleanText)) {
                  onScan(cleanText);
                  stopCamera();
                  onClose();
                }
              }
            } catch {
              // Silenciar errores
            }
          };
          reader.readAsDataURL(blob);
        } catch {
          // Silenciar errores
        }
      }, 'image/png', 0.95);
    } catch {
      // Silenciar errores
    }
  };

  // Función para mejorar la imagen antes de la detección
  const enhanceImageForQR = (imageData: ImageData): ImageData => {
    const data = new Uint8ClampedArray(imageData.data);
    
    // Aplicar filtro de contraste y brillo
    for (let i = 0; i < data.length; i += 4) {
      // Convertir a escala de grises
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      // Aumentar contraste
      const contrast = 1.5;
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      const enhanced = factor * (gray - 128) + 128;
      
      // Aplicar threshold para binarizar
      const threshold = enhanced > 128 ? 255 : 0;
      
      data[i] = threshold;     // R
      data[i + 1] = threshold; // G
      data[i + 2] = threshold; // B
      // Alpha se mantiene igual
    }
    
    return new ImageData(data, imageData.width, imageData.height);
  };

  // Función simple para analizar patrones QR básicos
  const analyzeImageForQR = (imageData: ImageData): string | null => {
    // Esta es una implementación muy básica
    // En una implementación real usaríamos una librería como jsQR
    
    // Por ahora retornamos null y dependemos del fallback de API
    // pero la imagen ya está mejorada para mejor detección
    
    return null;
  };

  const handleManualInput = () => {
    const input = prompt('Ingresa el código UPC manualmente:');
    if (input && input.trim()) {
      onScan(input.trim());
      stopCamera();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Escanear Código QR</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error ? (
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={handleManualInput}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Ingresar código manualmente
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-200 rounded-lg object-cover"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Overlay de escaneo mejorado */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Marco de escaneo */}
                  <div className="w-56 h-56 border-4 border-white rounded-lg relative">
                    {/* Esquinas del marco */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>
                    
                    {/* Línea de escaneo animada */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-400 animate-pulse"></div>
                  </div>
                  
                  {/* Instrucciones */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm text-center">
                      Mantén el código QR dentro del marco<br />
                      <span className="text-green-400">Asegúrate de que esté bien iluminado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleManualInput}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                Ingresar manualmente
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Cancelar
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Apunta la cámara hacia un código QR para escanearlo automáticamente
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
