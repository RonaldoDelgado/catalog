import { Product, PriceList } from '@/types';

export const samplePriceLists: PriceList[] = [
  {
    id: '1',
    title: 'Retail Prices',
    description: 'Standard retail pricing for end customers',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Wholesale Prices',
    description: 'Discounted pricing for wholesale customers',
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    title: 'Premium Prices',
    description: 'Premium pricing for luxury market segment',
    createdAt: new Date('2024-01-03'),
  },
];

export const sampleProducts: Product[] = [
  {
    id: '1',
    title: 'Wireless Bluetooth Headphones',
    code: 'WBH-001',
    upc: '16669512782',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    dimensions: {
      height: 20.5,
      width: 18.0,
      depth: 8.5,
    },
    prices: [
      { priceListId: '1', price: 199.99 },
      { priceListId: '2', price: 149.99 },
      { priceListId: '3', price: 249.99 },
    ],
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    title: 'Smart Fitness Watch',
    code: 'SFW-002',
    upc: '42018549708',
    description: 'Advanced fitness tracking watch with heart rate monitor, GPS, and smartphone connectivity. Water-resistant design.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    dimensions: {
      height: 4.5,
      width: 4.2,
      depth: 1.2,
    },
    prices: [
      { priceListId: '1', price: 299.99 },
      { priceListId: '2', price: 229.99 },
      { priceListId: '3', price: 349.99 },
    ],
    createdAt: new Date('2024-01-11'),
  },
  {
    id: '3',
    title: 'Portable Power Bank',
    code: 'PPB-003',
    upc: '38601662829',
    description: 'High-capacity 20000mAh power bank with fast charging technology. Compatible with all USB devices.',
    dimensions: {
      height: 15.0,
      width: 7.5,
      depth: 2.5,
    },
    prices: [
      { priceListId: '1', price: 49.99 },
      { priceListId: '2', price: 39.99 },
      { priceListId: '3', price: 59.99 },
    ],
    createdAt: new Date('2024-01-12'),
  },
  {
    id: '4',
    title: 'Mechanical Gaming Keyboard',
    code: 'MGK-004',
    upc: '75123456789',
    description: 'RGB backlit mechanical keyboard with customizable keys and programmable macros. Perfect for gaming and productivity.',
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop',
    dimensions: {
      height: 44.0,
      width: 13.5,
      depth: 4.0,
    },
    prices: [
      { priceListId: '1', price: 129.99 },
      { priceListId: '2', price: 99.99 },
      { priceListId: '3', price: 159.99 },
    ],
    createdAt: new Date('2024-01-13'),
  },
  {
    id: '5',
    title: 'Wireless Mouse',
    code: 'WM-005',
    upc: '95847362018',
    description: 'Ergonomic wireless mouse with precision tracking and long battery life. Suitable for both work and gaming.',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    dimensions: {
      height: 12.0,
      width: 6.5,
      depth: 4.0,
    },
    prices: [
      { priceListId: '1', price: 39.99 },
      { priceListId: '2', price: 29.99 },
      { priceListId: '3', price: 49.99 },
    ],
    createdAt: new Date('2024-01-14'),
  },
];
