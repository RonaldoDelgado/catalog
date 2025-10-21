'use client';

import { useState, useEffect } from 'react';
import { useApiContext } from '@/context/ApiContext';
import { Product, formatPrice, CreateProductDto, DEFAULT_PRODUCT_IMAGE } from '@/services/api';
import QRCode from '@/components/common/QRCode';
import ProductImport from './ProductImport';
import Image from 'next/image';

export default function ProductManager() {
  const { 
    products, 
    listPrices, 
    priceXLists,
    createProduct, 
    updateProduct, 
    deleteProduct,
    createPrice,
    isLoading 
  } = useApiContext();
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateProductDto>({
    title: '',
    code: '',
    upcCode: '',
    description: '',
    imageUrl: '',
    dimensions: '',
    otherExpectations: '',
  });
  
  const [productPrices, setProductPrices] = useState<{ [listPriceId: string]: number }>({});

  // Initialize prices when listPrices change
  useEffect(() => {
    const initialPrices: { [listPriceId: string]: number } = {};
    listPrices.forEach(list => {
      initialPrices[list.id] = 0;
    });
    setProductPrices(initialPrices);
  }, [listPrices]);

  const resetForm = () => {
    setFormData({
      title: '',
      code: '',
      upcCode: '',
      description: '',
      imageUrl: '',
      dimensions: '',
      otherExpectations: '',
    });
    const initialPrices: { [listPriceId: string]: number } = {};
    listPrices.forEach(list => {
      initialPrices[list.id] = 0;
    });
    setProductPrices(initialPrices);
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let savedProduct: Product;
      
      // Prepare form data, removing empty imageUrl
      const productData = {
        ...formData,
        imageUrl: formData.imageUrl?.trim() || undefined
      };
      
      if (editingProduct) {
        savedProduct = await updateProduct(editingProduct.id, productData);
      } else {
        savedProduct = await createProduct(productData);
      }
      
      // Save prices for each list
      const pricePromises = Object.entries(productPrices)
        .filter(([, price]) => price > 0)
        .map(([listPriceId, price]) => 
          createPrice({
            productId: savedProduct.id,
            listPriceId,
            price
          })
        );
      
      await Promise.all(pricePromises);
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      
      let errorMessage = 'Error saving product. Please try again.';
      
      // Type guard for axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string | string[] } } };
        if (axiosError.response?.data?.message) {
          if (Array.isArray(axiosError.response.data.message)) {
            errorMessage = axiosError.response.data.message.join(', ');
          } else {
            errorMessage = axiosError.response.data.message;
          }
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      code: product.code,
      upcCode: product.upcCode,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      dimensions: product.dimensions || '',
      otherExpectations: product.otherExpectations || '',
    });
    
    // Load existing prices
    const existingPrices: { [listPriceId: string]: number } = {};
    listPrices.forEach(list => {
      const priceEntry = priceXLists.find(p => 
        p.productId === product.id && p.listPriceId === list.id
      );
      existingPrices[list.id] = priceEntry ? priceEntry.price : 0;
    });
    setProductPrices(existingPrices);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const handleCreateNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleImportComplete = () => {
    // Refresh products list after import
    window.location.reload();
  };

  const getProductPrice = (product: Product, listPriceId: string): string => {
    const priceEntry = priceXLists.find(p => 
      p.productId === product.id && p.listPriceId === listPriceId
    );
    return priceEntry ? formatPrice(priceEntry.price) : 'Not set';
  };

  const updatePriceValue = (listPriceId: string, newPrice: number) => {
    setProductPrices(prev => ({
      ...prev,
      [listPriceId]: newPrice
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Products</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleCreateNew}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Create New Product
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-6 py-4 text-center text-black">
            Loading products...
          </div>
        </div>
      )}

      {/* Products Table */}
      {!isLoading && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    UPC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Prices
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-black">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Image
                            className="h-12 w-12 rounded object-cover border"
                            src={ DEFAULT_PRODUCT_IMAGE}
                            alt={product.title}
                            width={48}
                            height={48}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = DEFAULT_PRODUCT_IMAGE;
                            }}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-black">
                              {product.title}
                            </div>
                            <div className="text-sm text-black">
                              {product.description?.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black font-mono">
                          {product.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black font-mono">
                          {product.upcCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {listPrices.slice(0, 2).map(list => (
                            <div key={list.id} className="text-xs">
                              <span className="text-black">{list.title}:</span>{' '}
                              <span className="text-black font-medium">
                                {getProductPrice(product, list.id)}
                              </span>
                            </div>
                          ))}
                          {listPrices.length > 2 && (
                            <div className="text-xs text-black">
                              +{listPrices.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setViewingProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal - Enhanced Design */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 p-4 backdrop-blur-sm">
          <div className="relative top-4 mx-auto w-full max-w-5xl shadow-2xl rounded-xl bg-white overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    {editingProduct ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editingProduct ? 'Edit Product' : 'Create New Product'}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {editingProduct ? 'Update product information' : 'Add a new product to your catalog'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Basic Information */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-lg font-bold text-black">Basic Information</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="flex items-center space-x-2 text-sm font-bold text-black mb-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span>Product Title</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="title"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black px-4 py-3 transition-all duration-200 hover:border-gray-400"
                          placeholder="Enter product title..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="code" className="flex items-center space-x-2 text-sm font-bold text-black mb-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>Product Code</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="code"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black px-4 py-3 font-mono transition-all duration-200 hover:border-gray-400"
                            placeholder="PRD-001"
                          />
                        </div>

                        <div>
                          <label htmlFor="upcCode" className="flex items-center space-x-2 text-sm font-bold text-black mb-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>UPC Code</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="upcCode"
                            required
                            value={formData.upcCode}
                            onChange={(e) => setFormData({ ...formData, upcCode: e.target.value })}
                            className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black px-4 py-3 font-mono transition-all duration-200 hover:border-gray-400"
                            placeholder="123456789012"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="imageUrl" className="flex items-center space-x-2 text-sm font-bold text-black mb-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span>Image URL</span>
                        </label>
                        <input
                          type="url"
                          id="imageUrl"
                          value={formData.imageUrl || ''}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black px-4 py-3 transition-all duration-200 hover:border-gray-400"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="flex items-center space-x-2 text-sm font-bold text-black mb-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span>Description</span>
                        </label>
                        <textarea
                          id="description"
                          rows={4}
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black px-4 py-3 transition-all duration-200 hover:border-gray-400 resize-none"
                          placeholder="Describe your product..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Additional Information & Prices */}
                <div className="space-y-6">
                  {/* Additional Information */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <h4 className="text-lg font-bold text-black">Additional Information</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="dimensions" className="flex items-center space-x-2 text-sm font-bold text-black mb-2">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          <span>Dimensions</span>
                        </label>
                        <input
                          type="text"
                          id="dimensions"
                          value={formData.dimensions || ''}
                          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                          className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black px-4 py-3 transition-all duration-200 hover:border-gray-400"
                          placeholder="e.g., 10 x 5 x 3 cm, 2 kg"
                        />
                      </div>

                      <div>
                        <label htmlFor="otherExpectations" className="flex items-center space-x-2 text-sm font-bold text-black mb-2">
                          <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                          <span>Other Expectations</span>
                        </label>
                        <textarea
                          id="otherExpectations"
                          rows={3}
                          value={formData.otherExpectations || ''}
                          onChange={(e) => setFormData({ ...formData, otherExpectations: e.target.value })}
                          className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black px-4 py-3 transition-all duration-200 hover:border-gray-400 resize-none"
                          placeholder="Additional expectations or specifications..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Prices Section */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <h4 className="text-lg font-bold text-black">Price Lists</h4>
                    </div>
                    
                    <div className="space-y-3">
                      {listPrices.map(list => (
                        <div key={list.id} className="bg-white rounded-lg p-4 border border-yellow-300 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <label className="block text-sm font-bold text-black">
                                {list.title}
                              </label>
                              <p className="text-xs text-black mt-1">{list.description}</p>
                            </div>
                            <div className="w-32 ml-4">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={productPrices[list.id] || 0}
                                  onChange={(e) => updatePriceValue(list.id, parseFloat(e.target.value) || 0)}
                                  className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-black pl-8 pr-4 py-2 font-bold transition-all duration-200 hover:border-gray-400"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-8 mt-8 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="bg-gray-100 text-black px-8 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-bold border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    editingProduct ? 'Update Product' : 'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Modal - Enhanced Design */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 p-4 backdrop-blur-sm">
          <div className="relative top-4 mx-auto w-full max-w-4xl shadow-2xl rounded-xl bg-white overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Product Details
                  </h3>
                </div>
                <button
                  onClick={() => setViewingProduct(null)}
                  className="text-white hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-white hover:bg-opacity-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Product Header Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    <Image
                      className="h-32 w-32 rounded-xl object-cover border-4 border-white shadow-lg"
                      src={DEFAULT_PRODUCT_IMAGE}
                      alt={viewingProduct.title}
                      width={128}
                      height={128}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                    />
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      #{viewingProduct.code}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-black mb-2">{viewingProduct.title}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="font-medium text-black">Product Code:</span>
                        <span className="font-mono bg-gray-200 px-2 py-1 rounded text-black">{viewingProduct.code}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="font-medium text-black">UPC Code:</span>
                        <span className="font-mono bg-gray-200 px-2 py-1 rounded text-black">{viewingProduct.upcCode}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {viewingProduct.description && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h5 className="font-bold text-black">Description</h5>
                      </div>
                      <p className="text-black leading-relaxed">{viewingProduct.description}</p>
                    </div>
                  )}

                  {viewingProduct.dimensions && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <h5 className="font-bold text-black">Dimensions</h5>
                      </div>
                      <p className="text-black font-mono bg-orange-50 px-3 py-2 rounded-lg">{viewingProduct.dimensions}</p>
                    </div>
                  )}

                  {viewingProduct.otherExpectations && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h5 className="font-bold text-black">Other Expectations</h5>
                      </div>
                      <p className="text-black leading-relaxed">{viewingProduct.otherExpectations}</p>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Prices Section */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <h5 className="font-bold text-black">Price Lists</h5>
                    </div>
                    <div className="space-y-3">
                      {listPrices.map(list => (
                        <div key={list.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <span className="font-medium text-black">{list.title}</span>
                          <span className="font-bold text-green-700 text-lg">{getProductPrice(viewingProduct, list.id)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <h5 className="font-bold text-black">QR Code</h5>
                    </div>
                    <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                      <QRCode value={viewingProduct.upcCode} size={150} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={() => setViewingProduct(null)}
                  className="bg-gray-100 text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewingProduct(null);
                    handleEdit(viewingProduct);
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ProductImport
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
