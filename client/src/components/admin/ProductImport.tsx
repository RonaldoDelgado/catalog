'use client';

import { useState, useRef } from 'react';
import { apiClient, ImportResult } from '@/services/api';

interface ProductImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}


interface ParsedProduct {
  title: string;
  code: string;
  description: string;
  imageUrl: string;
  dimensions: string;
  otherExpectations: string;
  upcCode: string;
  prices: { [listName: string]: number };
}

export default function ProductImport({ isOpen, onClose, onImportComplete }: ProductImportProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
        alert('Please select a CSV or TXT file');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
      setParsedData([]);
      setShowPreview(false);
      
      // Parse file immediately for preview
      parseFileForPreview(file);
    }
  };

  const parseFileForPreview = async (file: File) => {
    try {
      const fileContent = await readFileContent(file);
      const parsed = parseCSVContent(fileContent);
      setParsedData(parsed);
      setShowPreview(true);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please check the format.');
    }
  };

  const parseCSVContent = (content: string): ParsedProduct[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    // Parse header
    const headers = lines[0].split('\t').map(h => h.trim());
    
    // Find basic product columns
    const basicColumns = ['title', 'code', 'description', 'imageUrl', 'dimensions', 'otherExpectations', 'upcCode'];
    const columnIndexes: { [key: string]: number } = {};
    
    basicColumns.forEach(col => {
      const index = headers.findIndex(h => h.toLowerCase() === col.toLowerCase());
      if (index !== -1) {
        columnIndexes[col] = index;
      }
    });

    // Identify price columns
    const priceColumns: { name: string; index: number }[] = [];
    headers.forEach((header, index) => {
      if (!basicColumns.some(col => col.toLowerCase() === header.toLowerCase())) {
        priceColumns.push({ name: header, index });
      }
    });

    // Parse data rows
    const products: ParsedProduct[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        console.log(`⏭️ Skipping empty line ${i + 1}`);
        continue; // Skip empty lines
      }
      
      const values = line.split('\t').map(v => v.trim());
      
      if (values.length === 0 || values.every(v => !v)) {
        console.log(`⏭️ Skipping empty row ${i + 1}`);
        continue; // Skip empty rows
      }

      console.log(`📝 Parsing row ${i + 1}:`, values);

      const prices: { [listName: string]: number } = {};
      priceColumns.forEach(priceCol => {
        const priceValue = parseFloat(values[priceCol.index]);
        if (!isNaN(priceValue) && priceValue > 0) {
          prices[priceCol.name] = priceValue;
        }
      });

      const product = {
        title: values[columnIndexes.title] || '',
        code: values[columnIndexes.code] || '',
        description: values[columnIndexes.description] || '',
        imageUrl: values[columnIndexes.imageUrl] || '',
        dimensions: values[columnIndexes.dimensions] || '',
        otherExpectations: values[columnIndexes.otherExpectations] || '',
        upcCode: values[columnIndexes.upcCode] || '',
        prices
      };

      // Validate required fields
      if (!product.title || !product.code || !product.upcCode) {
        console.warn(`⚠️ Row ${i + 1} missing required fields:`, {
          title: product.title,
          code: product.code,
          upcCode: product.upcCode
        });
      }

      console.log(`✅ Product ${i} parsed:`, {
        title: product.title,
        code: product.code,
        upcCode: product.upcCode,
        priceCount: Object.keys(product.prices).length
      });

      products.push(product);
    }

    return products;
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setIsUploading(true);
    try {
      console.log('🚀 Starting import process...');
      console.log('📄 Selected file:', selectedFile.name, 'Size:', selectedFile.size, 'bytes');
      
      // Read file content
      const fileContent = await readFileContent(selectedFile);
      console.log('📖 File content read successfully, length:', fileContent.length);
      console.log('📋 Parsed data preview:', parsedData.length, 'products found');
      
      // Log the products that will be sent
      parsedData.forEach((product, index) => {
        console.log(`Product ${index + 1}:`, {
          title: product.title,
          code: product.code,
          upcCode: product.upcCode,
          prices: Object.keys(product.prices).length
        });
      });
      
      // Send to API
      console.log('📡 Sending to API...');
      const result = await apiClient.importProducts(fileContent);
      console.log('📊 Import result:', result);
      
      setImportResult(result);
      
      if (result.success) {
        console.log('✅ Import completed successfully');
        onImportComplete();
      } else {
        console.log('❌ Import failed with errors:', result.errors);
      }
    } catch (error) {
      console.error('💥 Import error:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const fixEncodingIssues = (text: string): string => {
    // Fix the most common encoding issue: � character
    let fixedText = text;
    
    // Replace the generic replacement character with apostrophe
    fixedText = fixedText.replace(/�/g, "'");
    
    // Log if any fixes were applied
    if (fixedText !== text) {
      console.log('🔧 Applied encoding fixes to text');
    }
    
    return fixedText;
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        let content = e.target?.result as string;
        
        // Apply encoding fixes
        content = fixEncodingIssues(content);
        
        console.log('📄 File read with encoding fixes applied');
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
    setParsedData([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
      <div className="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Import Products from CSV
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Upload a CSV file with product data to import multiple products at once
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* File Upload Section */}
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {selectedFile ? selectedFile.name : 'Select CSV file'}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      CSV files with tab-separated values
                    </span>
                  </label>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".csv,.txt"
                    onChange={handleFileSelect}
                  />
                </div>
                <div className="mt-4 flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Choose File
                  </button>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="bg-gray-300 py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-400"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CSV Format Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Expected CSV Format:</h4>
            <div className="text-xs text-blue-700 font-mono">
              <div>title | code | description | imageUrl | dimensions | otherExpectations | upcCode | [Price List Names...]</div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              • First row should contain column headers<br/>
              • Columns after upcCode should match existing price list names<br/>
              • Use tab-separated values
            </p>
          </div>

          {/* Data Preview */}
          {showPreview && parsedData.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-800 mb-3">Data Preview ({parsedData.length} products found):</h4>
              <div className="max-h-96 overflow-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPC Code</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image URL</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Other Expectations</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prices</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.map((product, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 text-sm text-gray-900">{product.title}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{product.code}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{product.upcCode}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{product.description || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {product.imageUrl ? (
                            <a 
                              href={product.imageUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline truncate block max-w-32"
                              title={product.imageUrl}
                            >
                              {product.imageUrl.length > 30 ? `${product.imageUrl.substring(0, 30)}...` : product.imageUrl}
                            </a>
                          ) : (
                            <span className="text-gray-400">No image</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">{product.dimensions || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{product.otherExpectations || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {Object.entries(product.prices).map(([listName, price]) => (
                            <div key={listName} className="text-xs">
                              <span className="font-medium">{listName}:</span> ${price}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Review the data above to ensure it&apos;s correct before importing.
                </p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="mb-6">
              <div className={`p-4 rounded-md ${importResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {importResult.success ? (
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {importResult.success ? 'Import Successful!' : 'Import Failed'}
                    </h3>
                    <div className={`mt-2 text-sm ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      <p>Products created: {importResult.created}</p>
                      <p>Products updated: {importResult.updated || 0}</p>
                      <p>Total processed: {(importResult.created || 0) + (importResult.updated || 0)}</p>
                      {importResult.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Errors:</p>
                          <ul className="list-disc list-inside">
                            {importResult.errors.slice(0, 5).map((error, index) => (
                              <li key={index} className="text-xs">{error}</li>
                            ))}
                            {importResult.errors.length > 5 && (
                              <li className="text-xs">...and {importResult.errors.length - 5} more errors</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              {importResult?.success ? 'Close' : 'Cancel'}
            </button>
            {showPreview && parsedData.length > 0 && (
              <button
                type="button"
                onClick={handleImport}
                disabled={!selectedFile || isUploading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Importing...' : `Import ${parsedData.length} Products`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
