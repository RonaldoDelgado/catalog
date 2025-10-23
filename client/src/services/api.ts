import axios, { AxiosInstance } from 'axios';
import ENV from '@/config/env';

// API Configuration
const API_BASE_URL = ENV.API_URL;

// Default product image
export const DEFAULT_PRODUCT_IMAGE = '/default.imagen-product.png';

// Types
export interface Product {
  id: string;
  title: string;
  code: string;
  upcCode: string;
  description?: string;
  imageUrl?: string;
  dimensions?: string;
  otherExpectations?: string;
  priceXLists?: PriceXList[];
  createdAt: string;
  updatedAt: string;
}

export interface ListPrice {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  priceXLists?: PriceXList[];
  createdAt: string;
  updatedAt: string;
}

export interface PriceXList {
  id: string;
  productId: string;
  listPriceId: string;
  price: number;
  product?: Product;
  listPrice?: ListPrice;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  title: string;
  code: string;
  upcCode: string;
  description?: string;
  imageUrl?: string;
  dimensions?: string;
  otherExpectations?: string;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface CreateListPriceDto {
  title: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateListPriceDto extends Partial<CreateListPriceDto> {
  isActive?: boolean;
}

export interface CreatePriceXListDto {
  productId: string;
  listPriceId: string;
  price: number;
}

export type UpdatePriceXListDto = Partial<CreatePriceXListDto>;

export interface CatalogSettings {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCatalogSettingsDto {
  key: string;
  value: string;
  description?: string;
}

export type UpdateCatalogSettingsDto = Partial<CreateCatalogSettingsDto>;

export interface ImportResult {
  success: boolean;
  created: number;
  updated: number;
  errors: string[];
  details: {
    productId?: string;
    title: string;
    error?: string;
    action?: 'created' | 'updated';
  }[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  timestamp: string;
}

// API Client
class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    console.log('🔧 Initializing API client with baseURL:', baseURL);
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds timeout
      withCredentials: true, // Include credentials for CORS
    });

    // Request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`, config.data);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle the API response format
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Extract data from the standardized API response format
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          // Return the response with the extracted data
          return {
            ...response,
            data: response.data.data
          };
        }
        return response;
      },
      (error) => {
        console.error('API request failed:', error);
        
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        } else if (error.message) {
          throw new Error(error.message);
        } else {
          throw new Error('An unexpected error occurred');
        }
      }
    );
  }

  // Products API
  async getProducts(search?: string): Promise<Product[]> {
    const params = search ? { search } : {};
    const response = await this.axiosInstance.get('/products', { params });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.axiosInstance.get(`/products/${id}`);
    return response.data;
  }

  async getProductByCode(code: string): Promise<Product> {
    const response = await this.axiosInstance.get(`/products/code/${code}`);
    return response.data;
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await this.axiosInstance.post('/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await this.axiosInstance.patch(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.axiosInstance.delete(`/products/${id}`);
  }

  async importProducts(csvData: string): Promise<ImportResult> {
    const response = await this.axiosInstance.post('/products/import', { csvData });
    return response.data;
  }

  // List Prices API
  async getListPrices(search?: string): Promise<ListPrice[]> {
    const params = search ? { search } : {};
    const response = await this.axiosInstance.get('/list-prices', { params });
    return response.data;
  }

  async getListPrice(id: string): Promise<ListPrice> {
    const response = await this.axiosInstance.get(`/list-prices/${id}`);
    return response.data;
  }

  async createListPrice(data: CreateListPriceDto): Promise<ListPrice> {
    const response = await this.axiosInstance.post('/list-prices', data);
    return response.data;
  }

  async updateListPrice(id: string, data: UpdateListPriceDto): Promise<ListPrice> {
    const response = await this.axiosInstance.patch(`/list-prices/${id}`, data);
    return response.data;
  }

  async deleteListPrice(id: string): Promise<void> {
    await this.axiosInstance.delete(`/list-prices/${id}`);
  }

  // Price X List API
  async getPriceXLists(): Promise<PriceXList[]> {
    const response = await this.axiosInstance.get('/price-x-list');
    return response.data;
  }

  async getPriceXList(id: string): Promise<PriceXList> {
    const response = await this.axiosInstance.get(`/price-x-list/${id}`);
    return response.data;
  }

  async getPricesByProduct(productId: string): Promise<PriceXList[]> {
    const response = await this.axiosInstance.get(`/price-x-list/product/${productId}`);
    return response.data;
  }

  async getPricesByListPrice(listPriceId: string): Promise<PriceXList[]> {
    const response = await this.axiosInstance.get(`/price-x-list/list-price/${listPriceId}`);
    return response.data;
  }

  async getSpecificPrice(productId: string, listPriceId: string): Promise<PriceXList> {
    const response = await this.axiosInstance.get(`/price-x-list/product/${productId}/list-price/${listPriceId}`);
    return response.data;
  }

  async createPriceXList(data: CreatePriceXListDto): Promise<PriceXList> {
    const response = await this.axiosInstance.post('/price-x-list', data);
    return response.data;
  }

  async updatePriceXList(id: string, data: UpdatePriceXListDto): Promise<PriceXList> {
    const response = await this.axiosInstance.patch(`/price-x-list/${id}`, data);
    return response.data;
  }

  async deletePriceXList(id: string): Promise<void> {
    await this.axiosInstance.delete(`/price-x-list/${id}`);
  }

  // Catalog Settings API
  async getCatalogSettings(): Promise<CatalogSettings[]> {
    const response = await this.axiosInstance.get('/catalog-settings');
    return response.data;
  }

  async getCatalogSetting(id: string): Promise<CatalogSettings> {
    const response = await this.axiosInstance.get(`/catalog-settings/${id}`);
    return response.data;
  }

  async getCatalogSettingByKey(key: string): Promise<CatalogSettings> {
    const response = await this.axiosInstance.get(`/catalog-settings/key/${key}`);
    return response.data;
  }

  async getCatalogVisibility(): Promise<{ visible: boolean }> {
    const response = await this.axiosInstance.get('/catalog-settings/catalog-visibility');
    return response.data;
  }

  async setCatalogVisibility(visible: boolean): Promise<{ visible: boolean }> {
    const response = await this.axiosInstance.post('/catalog-settings/catalog-visibility', { visible });
    return response.data;
  }

  async createCatalogSetting(data: CreateCatalogSettingsDto): Promise<CatalogSettings> {
    const response = await this.axiosInstance.post('/catalog-settings', data);
    return response.data;
  }

  async updateCatalogSetting(id: string, data: UpdateCatalogSettingsDto): Promise<CatalogSettings> {
    const response = await this.axiosInstance.patch(`/catalog-settings/${id}`, data);
    return response.data;
  }

  async deleteCatalogSetting(id: string): Promise<void> {
    await this.axiosInstance.delete(`/catalog-settings/${id}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.axiosInstance.get('/health');
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Helper functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const getProductPrice = (product: Product, listPriceId: string): number | null => {
  if (!product.priceXLists) return null;
  
  const priceEntry = product.priceXLists.find(
    (price) => price.listPriceId === listPriceId
  );
  
  return priceEntry ? priceEntry.price : null;
};

export const getActiveListPrice = (listPrices: ListPrice[]): ListPrice | null => {
  if (!Array.isArray(listPrices)) {
    console.warn('getActiveListPrice: listPrices is not an array:', listPrices);
    return null;
  }
  return listPrices.find(list => list.isActive) || null;
};
