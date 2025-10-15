export interface PriceList {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

export interface ProductPrice {
  priceListId: string;
  price: number;
}

export interface Product {
  id: string;
  title: string;
  code: string;
  upc: string;
  description: string;
  image?: string;
  dimensions: {
    height: number;
    width: number;
    depth: number;
  };
  prices: ProductPrice[];
  createdAt: Date;
}

export interface AppState {
  products: Product[];
  priceLists: PriceList[];
  selectedPriceListId: string | null;
  isTableVisible: boolean;
  isAuthenticated: boolean;
}

export interface AppContextType extends AppState {
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Price list actions
  addPriceList: (priceList: Omit<PriceList, 'id' | 'createdAt'>) => void;
  updatePriceList: (id: string, priceList: Partial<PriceList>) => void;
  deletePriceList: (id: string) => void;
  
  // App settings
  setSelectedPriceListId: (id: string | null) => void;
  setTableVisibility: (visible: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
}
