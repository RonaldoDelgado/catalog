import { useState, useEffect } from 'react';
import getConfig from 'next/config';
import { 
  apiClient, 
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
  UpdateCatalogSettingsDto,
  getActiveListPrice,
  getProductPrice 
} from '@/services/api';

// Get the API base URL with better fallback detection
const getApiBaseUrl = () => {
  // Try multiple sources for the API URL
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Try Next.js runtime config
  let configUrl: string | undefined;
  try {
    const { publicRuntimeConfig } = getConfig() || {};
    configUrl = publicRuntimeConfig?.NEXT_PUBLIC_API_URL;
  } catch (error) {
    // getConfig might not be available in all contexts
    console.log('getConfig not available:', error);
  }
  
  // Log for debugging
  console.log('🔍 Environment variables:', {
    NEXT_PUBLIC_API_URL: envUrl,
    configUrl,
    NODE_ENV: process.env.NODE_ENV,
    all_env: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
  });
  
  // If we have the env var, use it
  if (envUrl) {
    console.log('✅ Using API URL from environment:', envUrl);
    return envUrl;
  }
  
  // Try config URL
  if (configUrl) {
    console.log('✅ Using API URL from config:', configUrl);
    return configUrl;
  }
  
  // Production fallback - try to detect Railway backend URL
  if (typeof window !== 'undefined' && window.location.hostname.includes('railway.app')) {
    // Try to construct the backend URL based on the frontend URL
    const frontendUrl = window.location.origin;
    const backendUrl = frontendUrl.replace('-client', '-server').replace('/api/v1', '') + '/api/v1';
    console.log('🔄 Attempting Railway backend URL:', backendUrl);
    return backendUrl;
  }
  
  // Development fallback
  const fallbackUrl = 'http://localhost:3001/api/v1';
  console.log('⚠️ Using fallback URL:', fallbackUrl);
  return fallbackUrl;
};

const API_BASE_URL = getApiBaseUrl();

export interface UseApiState {
  products: Product[];
  listPrices: ListPrice[];
  priceXLists: PriceXList[];
  catalogSettings: CatalogSettings[];
  activeListPrice: ListPrice | null;
  isCatalogVisible: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useApi() {
  const [state, setState] = useState<UseApiState>({
    products: [],
    listPrices: [],
    priceXLists: [],
    catalogSettings: [],
    activeListPrice: null,
    isCatalogVisible: true,
    isLoading: true,
    error: null,
  });

  // Load initial data
  const loadData = async () => {
    try {
      console.log('🔄 Loading data from API...', API_BASE_URL);
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [products, listPrices, priceXLists, catalogSettings, catalogVisibility] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getListPrices(),
        apiClient.getPriceXLists(),
        apiClient.getCatalogSettings(),
        apiClient.getCatalogVisibility(),
      ]);
      
      console.log('✅ Data loaded successfully:', { 
        products: products.length, 
        listPrices: listPrices.length,
        priceXLists: priceXLists.length,
        catalogSettings: catalogSettings.length,
        catalogVisibility 
      });


      const activeListPrice = getActiveListPrice(listPrices);

      setState({
        products,
        listPrices,
        priceXLists,
        catalogSettings,
        activeListPrice,
        isCatalogVisible: catalogVisibility.visible,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  // Search products
  const searchProducts = async (searchTerm: string): Promise<Product[]> => {
    try {
      return await apiClient.getProducts(searchTerm);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  };

  // Product operations
  const createProduct = async (productData: CreateProductDto): Promise<Product> => {
    try {
      const newProduct = await apiClient.createProduct(productData);
      setState(prev => ({
        ...prev,
        products: [...prev.products, newProduct],
      }));
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: UpdateProductDto): Promise<Product> => {
    try {
      const updatedProduct = await apiClient.updateProduct(id, productData);
      setState(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === id ? updatedProduct : p),
      }));
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      await apiClient.deleteProduct(id);
      setState(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // List price operations
  const createListPrice = async (listPriceData: CreateListPriceDto): Promise<ListPrice> => {
    try {
      console.log('🔄 Creating list price...', listPriceData);
      const newListPrice = await apiClient.createListPrice(listPriceData);
      console.log('✅ List price created successfully:', newListPrice);
      setState(prev => ({
        ...prev,
        listPrices: [...prev.listPrices, newListPrice],
      }));
      return newListPrice;
    } catch (error) {
      console.error('❌ Error creating list price:', error);
      throw error;
    }
  };

  const updateListPrice = async (id: string, listPriceData: UpdateListPriceDto): Promise<ListPrice> => {
    try {
      const updatedListPrice = await apiClient.updateListPrice(id, listPriceData);
      setState(prev => {
        const updatedListPrices = prev.listPrices.map(lp => 
          lp.id === id ? updatedListPrice : lp
        );
        return {
          ...prev,
          listPrices: updatedListPrices,
          activeListPrice: getActiveListPrice(updatedListPrices),
        };
      });
      return updatedListPrice;
    } catch (error) {
      console.error('Error updating list price:', error);
      throw error;
    }
  };

  const deleteListPrice = async (id: string): Promise<void> => {
    try {
      await apiClient.deleteListPrice(id);
      setState(prev => {
        const updatedListPrices = prev.listPrices.filter(lp => lp.id !== id);
        return {
          ...prev,
          listPrices: updatedListPrices,
          activeListPrice: getActiveListPrice(updatedListPrices),
        };
      });
    } catch (error) {
      console.error('Error deleting list price:', error);
      throw error;
    }
  };

  // Set active list price
  const setActiveListPrice = async (id: string): Promise<void> => {
    try {
      // Update the selected list price to active
      // The backend will automatically deactivate all others
      await apiClient.updateListPrice(id, { isActive: true });
      
      // Reload list prices to get updated state
      const updatedListPrices = await apiClient.getListPrices();
      setState(prev => ({
        ...prev,
        listPrices: updatedListPrices,
        activeListPrice: getActiveListPrice(updatedListPrices),
      }));
    } catch (error) {
      console.error('Error setting active list price:', error);
      throw error;
    }
  };

  // Price operations
  const createPrice = async (priceData: CreatePriceXListDto): Promise<PriceXList> => {
    try {
      const newPrice = await apiClient.createPriceXList(priceData);
      setState(prev => ({
        ...prev,
        priceXLists: [...prev.priceXLists, newPrice],
      }));
      return newPrice;
    } catch (error) {
      console.error('Error creating price:', error);
      throw error;
    }
  };

  const updatePrice = async (id: string, priceData: UpdatePriceXListDto): Promise<PriceXList> => {
    try {
      const updatedPrice = await apiClient.updatePriceXList(id, priceData);
      setState(prev => ({
        ...prev,
        priceXLists: prev.priceXLists.map(p => p.id === id ? updatedPrice : p),
      }));
      return updatedPrice;
    } catch (error) {
      console.error('Error updating price:', error);
      throw error;
    }
  };

  const deletePrice = async (id: string): Promise<void> => {
    try {
      await apiClient.deletePriceXList(id);
      setState(prev => ({
        ...prev,
        priceXLists: prev.priceXLists.filter(p => p.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting price:', error);
      throw error;
    }
  };

  // Catalog Settings operations
  const setCatalogVisibility = async (visible: boolean): Promise<void> => {
    try {
      const result = await apiClient.setCatalogVisibility(visible);
      setState(prev => ({
        ...prev,
        isCatalogVisible: result.visible,
      }));
    } catch (error) {
      console.error('Error setting catalog visibility:', error);
      throw error;
    }
  };

  const createCatalogSetting = async (settingData: CreateCatalogSettingsDto): Promise<CatalogSettings> => {
    try {
      const newSetting = await apiClient.createCatalogSetting(settingData);
      setState(prev => ({
        ...prev,
        catalogSettings: [...prev.catalogSettings, newSetting],
      }));
      return newSetting;
    } catch (error) {
      console.error('Error creating catalog setting:', error);
      throw error;
    }
  };

  const updateCatalogSetting = async (id: string, settingData: UpdateCatalogSettingsDto): Promise<CatalogSettings> => {
    try {
      const updatedSetting = await apiClient.updateCatalogSetting(id, settingData);
      setState(prev => ({
        ...prev,
        catalogSettings: prev.catalogSettings.map(s => s.id === id ? updatedSetting : s),
      }));
      return updatedSetting;
    } catch (error) {
      console.error('Error updating catalog setting:', error);
      throw error;
    }
  };

  const deleteCatalogSetting = async (id: string): Promise<void> => {
    try {
      await apiClient.deleteCatalogSetting(id);
      setState(prev => ({
        ...prev,
        catalogSettings: prev.catalogSettings.filter(s => s.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting catalog setting:', error);
      throw error;
    }
  };

  // Get product price for active list
  const getProductPriceForActiveList = (product: Product): number | null => {
    if (!state.activeListPrice) return null;
    return getProductPrice(product, state.activeListPrice.id);
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  return {
    ...state,
    // Data operations
    loadData,
    searchProducts,
    
    // Product operations
    createProduct,
    updateProduct,
    deleteProduct,
    
    // List price operations
    createListPrice,
    updateListPrice,
    deleteListPrice,
    setActiveListPrice,
    
    // Price operations
    createPrice,
    updatePrice,
    deletePrice,
    
    // Catalog Settings operations
    setCatalogVisibility,
    createCatalogSetting,
    updateCatalogSetting,
    deleteCatalogSetting,
    
    // Utilities
    getProductPriceForActiveList,
  };
}
