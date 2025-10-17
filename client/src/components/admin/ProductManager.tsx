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
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
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
          <div className="px-6 py-4 text-center text-gray-500">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UPC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prices
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
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
                            src={product.imageUrl || DEFAULT_PRODUCT_IMAGE}
                            alt={product.title}
                            width={48}
                            height={48}
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
                        <div className="text-sm text-gray-900 font-mono">
                          {product.upcCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {listPrices.slice(0, 2).map(list => (
                            <div key={list.id} className="text-xs">
                              <span className="text-gray-500">{list.title}:</span>{' '}
                              <span className="font-medium">
                                {getProductPrice(product, list.id)}
                              </span>
                            </div>
                          ))}
                          {listPrices.length > 2 && (
                            <div className="text-xs text-gray-400">
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700">Basic Information</h4>
                    
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>

                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                        Product Code *
                      </label>
                      <input
                        type="text"
                        id="code"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>

                    <div>
                      <label htmlFor="upcCode" className="block text-sm font-medium text-gray-700">
                        UPC Code *
                      </label>
                      <input
                        type="text"
                        id="upcCode"
                        required
                        value={formData.upcCode}
                        onChange={(e) => setFormData({ ...formData, upcCode: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>

                    <div>
                      <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                        Image URL
                      </label>
                      <input
                        type="url"
                        id="imageUrl"
                        value={formData.imageUrl || ''}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>
                  </div>

                  {/* Dimensions and Other Expectations */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700">Additional Information</h4>
                    
                    <div>
                      <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        id="dimensions"
                        value={formData.dimensions || ''}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                        placeholder="e.g., 10 x 5 x 3 cm, 2 kg"
                      />
                    </div>

                    <div>
                      <label htmlFor="otherExpectations" className="block text-sm font-medium text-gray-700">
                        Other Expectations
                      </label>
                      <textarea
                        id="otherExpectations"
                        rows={3}
                        value={formData.otherExpectations || ''}
                        onChange={(e) => setFormData({ ...formData, otherExpectations: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                        placeholder="Additional expectations or specifications..."
                      />
                    </div>

                    {/* Prices Section */}
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-700 mb-4">Prices by List</h4>
                      <div className="space-y-3">
                        {listPrices.map(list => (
                          <div key={list.id} className="flex items-center space-x-3">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700">
                                {list.title}
                              </label>
                              <p className="text-xs text-gray-500">{list.description}</p>
                            </div>
                            <div className="w-32">
                              <input
                                type="number"
                                step="0.01"
                                value={productPrices[list.id] || 0}
                                onChange={(e) => updatePriceValue(list.id, parseFloat(e.target.value) || 0)}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Product Details
                </h3>
                <button
                  onClick={() => setViewingProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Image
                    className="h-20 w-20 rounded object-cover border"
                    src={viewingProduct.imageUrl || DEFAULT_PRODUCT_IMAGE}
                    alt={viewingProduct.title}
                    width={80}
                    height={80}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{viewingProduct.title}</h4>
                    <p className="text-sm text-gray-500">Code: {viewingProduct.code}</p>
                    <p className="text-sm text-gray-500">UPC: {viewingProduct.upcCode}</p>
                  </div>
                </div>

                {viewingProduct.description && (
                  <div>
                    <h5 className="font-medium text-gray-700">Description</h5>
                    <p className="text-gray-600">{viewingProduct.description}</p>
                  </div>
                )}

                {viewingProduct.dimensions && (
                  <div>
                    <h5 className="font-medium text-gray-700">Dimensions</h5>
                    <p className="text-gray-600">{viewingProduct.dimensions}</p>
                  </div>
                )}

                {viewingProduct.otherExpectations && (
                  <div>
                    <h5 className="font-medium text-gray-700">Other Expectations</h5>
                    <p className="text-gray-600">{viewingProduct.otherExpectations}</p>
                  </div>
                )}

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Prices</h5>
                  <div className="space-y-2">
                    {listPrices.map(list => (
                      <div key={list.id} className="flex justify-between items-center">
                        <span className="text-gray-600">{list.title}:</span>
                        <span className="font-medium">{getProductPrice(viewingProduct, list.id)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">QR Code</h5>
                  <QRCode value={viewingProduct.upcCode} size={150} />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  onClick={() => setViewingProduct(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewingProduct(null);
                    handleEdit(viewingProduct);
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
            aaaaaaaaaaaaaaaa
      {/* Import Modal */}
      <ProductImport
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
