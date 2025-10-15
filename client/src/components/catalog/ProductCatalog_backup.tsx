'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import QRCode from '@/components/common/QRCode';
import { Product } from '@/types';

interface ProductCatalogProps {
  onAdminClick?: () => void;
}

export default function ProductCatalog({ onAdminClick }: ProductCatalogProps) {
  const {
    products,
    priceLists,
    selectedPriceListId,
    isTableVisible,
  } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(term) ||
        product.code.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  // Get price for a product based on selected price list
  const getProductPrice = (product: Product): string => {
    if (!selectedPriceListId) return 'N/A';
    
    const price = product.prices.find(p => p.priceListId === selectedPriceListId);
    return price ? `$${price.price.toFixed(2)}` : 'N/A';
  };

  const selectedPriceList = priceLists.find(pl => pl.id === selectedPriceListId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <img
                  src="/company-logo.png"
                  alt="Company Logo"
                  className="h-12 w-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <h1 className="ml-4 text-2xl font-bold text-gray-900">
                  Product Management System
                </h1>
              </div>
            </div>
            <button
              onClick={onAdminClick}
              className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="max-w-md">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by title or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border text-gray-900 bg-white font-medium placeholder-gray-400"
              />
            </div>
          </div>

          {/* Price List Info */}
          {selectedPriceList && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Active Price List:</strong> {selectedPriceList.title}
              </p>
            </div>
          )}

          {/* Products Table */}
          {isTableVisible ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Product List
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Browse our complete product catalog
                </p>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500">
                    {searchTerm ? 'No products found matching your search.' : 'No products available.'}
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
                          UPC / QR
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dimensions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <img
                                  className="h-16 w-16 rounded object-cover border"
                                  src={product.image || '/default-product.svg'}
                                  alt={product.title}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/default-product.svg';
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.title}
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
                            <div className="flex flex-col items-center space-y-2">
                              <div className="text-xs text-gray-600 font-mono">
                                {product.upc}
                              </div>
                              <QRCode value={product.upc} size={60} />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-green-600">
                              {getProductPrice(product)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.dimensions.height} × {product.dimensions.width} × {product.dimensions.depth}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {product.description}
                            </div>
                          </td>
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
    </div>
  );
}
