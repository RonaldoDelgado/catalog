# Product Management System

A comprehensive product management and catalog system built with Next.js 15, React Context, and TypeScript. This application allows administrators to manage products and price lists while providing a public catalog view for customers.

## Features

### Admin Panel
- **Authentication**: Secure admin access with password protection (`Pasword2026*-`)
- **Product Management**: Create, read, update, and delete products with multiple price lists
- **Price List Management**: Manage different pricing tiers (Retail, Wholesale, Premium)
- **Catalog Control**: Toggle product table visibility and select active price lists
- **Product Details**: Manage product information including images, dimensions, and descriptions

### Public Catalog
- **Product Display**: View products with selected pricing
- **Search Functionality**: Search products by title or code
- **Responsive Design**: Mobile-friendly interface
- **Dynamic Pricing**: Display prices based on selected price list

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Public Catalog View
- Browse products in the main catalog
- Use the search bar to find products by title or code
- View product details including images, prices, and dimensions
- Click "Admin" button to access admin panel

### Admin Access
1. Click the "Admin" button in the top-right corner
2. Enter the admin password: `Pasword2026*-`
3. Access the admin dashboard

### Admin Dashboard
- **Dashboard**: Configure catalog visibility and select active price list
- **Price Lists**: Create and manage different pricing tiers
- **Products**: Add, edit, view, and delete products

### Managing Products
1. Go to Admin Panel → Products
2. Click "Create New Product" to add a product
3. Fill in product details:
   - Title and code
   - Description
   - Image URL (optional)
   - Dimensions (height, width, depth)
   - Prices for each price list
4. Save the product

### Managing Price Lists
1. Go to Admin Panel → Price Lists
2. Click "Create New Price List"
3. Enter title and description
4. Save the price list

## Project Structure

```
src/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── admin/            # Admin panel components
│   ├── auth/             # Authentication components
│   └── catalog/          # Public catalog components
├── context/              # React Context providers
├── data/                 # Sample data
└── types/                # TypeScript type definitions
```

## Sample Data

The application comes with pre-loaded sample data including:
- 3 price lists (Retail, Wholesale, Premium)
- 5 sample products with different categories
- Realistic pricing across all price lists

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **UI Components**: Custom components with Tailwind CSS

## Configuration

### Admin Password
The admin password is currently hardcoded as `Pasword2026*-`. In a production environment, this should be moved to environment variables.

### Default Settings
- Product table is visible by default
- First price list is selected by default
- Sample data is loaded on application start

## Future Enhancements

- API integration for data persistence
- User authentication and authorization
- Image upload functionality
- Advanced filtering and sorting
- Export/import capabilities
- Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and demonstration purposes.
