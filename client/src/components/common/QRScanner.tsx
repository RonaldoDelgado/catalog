'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

// Definir tipos para los resultados del escáner
interface QRResult {
  rawValue?: string;
  text?: string;
}

export default function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: QRResult[] | null) => {
    if (result && result.length > 0) {
      const scannedText = result[0]?.rawValue || result[0]?.text || '';
      
      console.log('🔍 QR Scanned:', scannedText);
      
      // Validar que sea un código válido (permitir códigos de 6-14 dígitos)
      const cleanText = scannedText.trim();
      
      // Aceptar códigos numéricos de 6-14 dígitos o códigos alfanuméricos
      if (/^\d{6,14}$/.test(cleanText) || /^[A-Za-z0-9]{6,20}$/.test(cleanText)) {
        console.log('✅ Valid code detected:', cleanText);
        onScan(cleanText);
        onClose();
      } else {
        console.log('❌ Invalid code format:', cleanText);
        alert(`Código no válido: ${cleanText}. Debe ser un código de producto válido.`);
      }
    }
  };

  const handleError = (error: unknown) => {
    console.error('QR Scanner error:', error);
    
    let errorMessage = 'Error desconocido';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    }
    
    setError(`Error al acceder a la cámara: ${errorMessage}. Verifica los permisos.`);
  };

  const handleManualInput = () => {
    const input = prompt('Ingresa el código del producto manualmente:');
    if (input && input.trim()) {
      const cleanInput = input.trim();
      if (/^\d{6,14}$/.test(cleanInput) || /^[A-Za-z0-9]{6,20}$/.test(cleanInput)) {
        console.log('📝 Manual input:', cleanInput);
        onScan(cleanInput);
        onClose();
      } else {
        alert('Por favor ingresa un código válido (6-20 caracteres alfanuméricos)');
      }
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
              <Scanner
                onScan={handleScan}
                onError={handleError}
                constraints={{
                  facingMode: 'environment', // Usar cámara trasera
                  width: { ideal: 640 },
                  height: { ideal: 480 }
                }}
                styles={{
                  container: {
                    width: '100%',
                    height: '300px',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  },
                  video: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }
                }}
                components={{
                  finder: true,
                  torch: true,
                  zoom: false
                }}
              />
              
              {/* Overlay con instrucciones */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm text-center">
                  Apunta la cámara hacia el código QR<br />
                  <span className="text-green-400">Mantén el código dentro del marco</span>
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
              El escáner detectará automáticamente códigos QR válidos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
