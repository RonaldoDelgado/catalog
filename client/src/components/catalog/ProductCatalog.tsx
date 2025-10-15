"use client";

import { useState, useEffect } from "react";
import { useApiContext } from "@/context/ApiContext";
import QRScanner from "@/components/common/QRScanner";
import { Product, formatPrice, DEFAULT_PRODUCT_IMAGE } from "@/services/api";
import Image from "next/image";

interface ProductCatalogProps {
  onAdminClick?: () => void;
}

export default function ProductCatalog({ onAdminClick }: ProductCatalogProps) {
  const { 
    products, 
    activeListPrice, 
    isCatalogVisible, 
    isLoading, 
    error,
    searchProducts,
    getProductPriceForActiveList 
  } = useApiContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Update filtered products when products or search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      searchProducts(searchTerm)
        .then(setFilteredProducts)
        .catch(console.error);
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchTerm, searchProducts]);

  const getProductPrice = (product: Product) => {
    const price = getProductPriceForActiveList(product);
    return price ? formatPrice(price) : "Price not set";
  };

  const handleQRScan = async (scannedCode: string) => {
    try {
      // Buscar el producto por UPC usando la API
      const searchResults = await searchProducts(scannedCode);
      const foundProduct = searchResults.find(
        (product) => product.upcCode === scannedCode
      );

      if (foundProduct) {
        // Si encuentra el producto, establecer el término de búsqueda para mostrarlo
        setSearchTerm(scannedCode);
      } else {
        // Si no encuentra el producto, mostrar alerta
        alert(`No se encontró ningún producto con el código UPC: ${scannedCode}`);
      }
    } catch (error) {
      console.error('Error searching for product:', error);
      alert('Error al buscar el producto. Por favor, intente de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Image
                className="h-8 w-8"
                src="/default-product.svg"
                alt="Company Logo"
                width={32}
                height={32}
              />
              <h1 className="text-2xl font-bold text-gray-900">
                Product Catalog
              </h1>
            </div>
            {onAdminClick && (
              <button
                onClick={onAdminClick}
                className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search Section */}
          <div className="mb-6">
            <div className="max-w-2xl">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Products
              </label>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by title, code, or UPC..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border text-gray-900 bg-white font-medium placeholder-gray-400"
                  />
                </div>
                <button
                  onClick={() => setIsQRScannerOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  title="Escanear código QR"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h.01M12 12v.01M12 12v4.01"
                    />
                  </svg>
                  <span className="hidden sm:inline">Escanear QR</span>
                </button>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    title="Limpiar búsqueda"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Price List Info */}
          {activeListPrice && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Active Price List:</strong> {activeListPrice.title}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {activeListPrice.description}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-md">
              <p className="text-sm text-red-800">Error: {error}</p>
            </div>
          )}

          {isCatalogVisible ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Products
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Browse our complete product catalog
                </p>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500">
                    {searchTerm
                      ? "No products found matching your search."
                      : "No products available."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dimensions
                        </th>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th> */}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Image
                                className="h-16 w-16 rounded object-cover border"
                                src={product?.imageUrl || DEFAULT_PRODUCT_IMAGE}
                                alt={product.title}
                                width={64}
                                height={64}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = DEFAULT_PRODUCT_IMAGE;
                                }}
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.description?.substring(0, 50)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">
                              {product.code}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-green-600">
                              {getProductPrice(product)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.dimensions ? (
                                `${product.dimensions.height || 'N/A'} × ${product.dimensions.width || 'N/A'} × ${product.dimensions.length || 'N/A'} ${product.dimensions.unit || 'cm'}`
                              ) : (
                                'No dimensions'
                              )}
                            </div>
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setViewingProduct(product)}
                              className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                            >
                              Ver detalles
                            </button>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow rounded-md p-8 text-center">
              <p className="text-gray-500">
                Product catalog is currently disabled by the administrator.
              </p>
            </div>
          )}
        </div>
      </main>
      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onScan={handleQRScan}
        onClose={() => setIsQRScannerOpen(false)}
      />
    </div>
  );
}
