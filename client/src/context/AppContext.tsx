'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppContextType, Product, PriceList } from '@/types';
import { sampleProducts, samplePriceLists } from '@/data/sampleData';

// Initial state
const initialState: AppState = {
  products: sampleProducts,
  priceLists: samplePriceLists,
  selectedPriceListId: samplePriceLists[0]?.id || null,
  isTableVisible: true,
  isAuthenticated: false,
};

// Action types
type AppAction =
  | { type: 'ADD_PRODUCT'; payload: Omit<Product, 'id' | 'createdAt'> }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; product: Partial<Product> } }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_PRICE_LIST'; payload: Omit<PriceList, 'id' | 'createdAt'> }
  | { type: 'UPDATE_PRICE_LIST'; payload: { id: string; priceList: Partial<PriceList> } }
  | { type: 'DELETE_PRICE_LIST'; payload: string }
  | { type: 'SET_SELECTED_PRICE_LIST'; payload: string | null }
  | { type: 'SET_TABLE_VISIBILITY'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean };

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [
          ...state.products,
          {
            ...action.payload,
            id: Date.now().toString(),
            createdAt: new Date(),
          },
        ],
      };
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id
            ? { ...product, ...action.payload.product }
            : product
        ),
      };
    
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
      };
    
    case 'ADD_PRICE_LIST':
      return {
        ...state,
        priceLists: [
          ...state.priceLists,
          {
            ...action.payload,
            id: Date.now().toString(),
            createdAt: new Date(),
          },
        ],
      };
    
    case 'UPDATE_PRICE_LIST':
      return {
        ...state,
        priceLists: state.priceLists.map(priceList =>
          priceList.id === action.payload.id
            ? { ...priceList, ...action.payload.priceList }
            : priceList
        ),
      };
    
    case 'DELETE_PRICE_LIST':
      return {
        ...state,
        priceLists: state.priceLists.filter(priceList => priceList.id !== action.payload),
        selectedPriceListId: state.selectedPriceListId === action.payload ? null : state.selectedPriceListId,
      };
    
    case 'SET_SELECTED_PRICE_LIST':
      return {
        ...state,
        selectedPriceListId: action.payload,
      };
    
    case 'SET_TABLE_VISIBILITY':
      return {
        ...state,
        isTableVisible: action.payload,
      };
    
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    
    default:
      return state;
  }
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const contextValue: AppContextType = {
    ...state,
    
    // Product actions
    addProduct: (product) => {
      dispatch({ type: 'ADD_PRODUCT', payload: product });
    },
    
    updateProduct: (id, product) => {
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id, product } });
    },
    
    deleteProduct: (id) => {
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    },
    
    // Price list actions
    addPriceList: (priceList) => {
      dispatch({ type: 'ADD_PRICE_LIST', payload: priceList });
    },
    
    updatePriceList: (id, priceList) => {
      dispatch({ type: 'UPDATE_PRICE_LIST', payload: { id, priceList } });
    },
    
    deletePriceList: (id) => {
      dispatch({ type: 'DELETE_PRICE_LIST', payload: id });
    },
    
    // App settings
    setSelectedPriceListId: (id) => {
      dispatch({ type: 'SET_SELECTED_PRICE_LIST', payload: id });
    },
    
    setTableVisibility: (visible) => {
      dispatch({ type: 'SET_TABLE_VISIBILITY', payload: visible });
    },
    
    setAuthenticated: (authenticated) => {
      dispatch({ type: 'SET_AUTHENTICATED', payload: authenticated });
    },
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
