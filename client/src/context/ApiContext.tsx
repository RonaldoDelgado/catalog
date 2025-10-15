'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useApi, UseApiState } from '@/hooks/useApi';
import { 
  Product, 
  ListPrice, 
  PriceXList,
  CatalogSettings,
  CreateProductDto,
  UpdateProductDto,
  CreateListPriceDto,
  UpdateListPriceDto,
  CreatePriceXListDto,
  UpdatePriceXListDto,
  CreateCatalogSettingsDto,
  UpdateCatalogSettingsDto
} from '@/services/api';

interface ApiContextType extends UseApiState {
  // App state
  isAuthenticated: boolean;
  
  // App actions
  setAuthenticated: (authenticated: boolean) => void;
  
  // Data operations
  loadData: () => Promise<void>;
  searchProducts: (searchTerm: string) => Promise<Product[]>;
  
  // Product operations
  createProduct: (productData: CreateProductDto) => Promise<Product>;
  updateProduct: (id: string, productData: UpdateProductDto) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  
  // List price operations
  createListPrice: (listPriceData: CreateListPriceDto) => Promise<ListPrice>;
  updateListPrice: (id: string, listPriceData: UpdateListPriceDto) => Promise<ListPrice>;
  deleteListPrice: (id: string) => Promise<void>;
  setActiveListPrice: (id: string) => Promise<void>;
  
  // Price operations
  createPrice: (priceData: CreatePriceXListDto) => Promise<PriceXList>;
  updatePrice: (id: string, priceData: UpdatePriceXListDto) => Promise<PriceXList>;
  deletePrice: (id: string) => Promise<void>;
  
  // Catalog Settings operations
  setCatalogVisibility: (visible: boolean) => Promise<void>;
  createCatalogSetting: (settingData: CreateCatalogSettingsDto) => Promise<CatalogSettings>;
  updateCatalogSetting: (id: string, settingData: UpdateCatalogSettingsDto) => Promise<CatalogSettings>;
  deleteCatalogSetting: (id: string) => Promise<void>;
  
  // Utilities
  getProductPriceForActiveList: (product: Product) => number | null;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const apiState = useApi();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuthenticatedState = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
  };

  const contextValue: ApiContextType = {
    ...apiState,
    isAuthenticated,
    setAuthenticated: setAuthenticatedState,
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApiContext() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
}
