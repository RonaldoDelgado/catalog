// Environment configuration
export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Log environment configuration
console.log('🔧 Environment Configuration:', ENV);

export default ENV;
