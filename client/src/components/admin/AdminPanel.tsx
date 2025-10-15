'use client';

import { useState } from 'react';
import { useApiContext } from '@/context/ApiContext';
import PriceListManager from '@/components/admin/PriceListManager';
import ProductManager from '@/components/admin/ProductManager';

type ActiveView = 'dashboard' | 'priceLists' | 'products';

export default function AdminPanel() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const {
    listPrices,
    isCatalogVisible,
    setActiveListPrice,
    setCatalogVisibility,
    setAuthenticated,
  } = useApiContext();

  const handleLogout = () => {
    setAuthenticated(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'priceLists':
        return <PriceListManager />;
      case 'products':
        return <ProductManager />;
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            
            {/* Table Visibility Control */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Catalog Table Settings
              </h3>
              <div className="flex items-center">
                <input
                  id="catalog-visibility"
                  type="checkbox"
                  checked={isCatalogVisible}
                  onChange={(e) => setCatalogVisibility(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="catalog-visibility" className="ml-2 block text-sm text-gray-900">
                  Show product catalog to users
                </label>
              </div>
            </div>

            {/* Price List Selector */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Active Price List
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {listPrices.map((priceList) => (
                  <button
                    key={priceList.id}
                    onClick={() => setActiveListPrice(priceList.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      priceList.isActive
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${
                          priceList.isActive ? 'text-indigo-900' : 'text-gray-900'
                        }`}>
                          {priceList.title}
                        </h4>
                        <p className={`text-sm ${
                          priceList.isActive ? 'text-indigo-600' : 'text-gray-500'
                        }`}>
                          {priceList.description || 'No description'}
                        </p>
                        {priceList.isActive && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      {priceList.isActive && (
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500">
                This price list will be used to display product prices in the catalog
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveView('priceLists')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Price Lists
              </button>
              <button
                onClick={() => setActiveView('products')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Manage Products
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Panel</h1>
              <nav className="flex flex-wrap gap-2 sm:space-x-4">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                    activeView === 'dashboard'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('priceLists')}
                  className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                    activeView === 'priceLists'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Price Lists
                </button>
                <button
                  onClick={() => setActiveView('products')}
                  className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                    activeView === 'products'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Products
                </button>
              </nav>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <button
                onClick={() => setAuthenticated(false)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                View Catalog
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
