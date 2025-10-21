// Environment configuration with multiple fallbacks
const getApiUrl = (): string => {
  // Check multiple sources for the API URL
  const sources = [
    process.env.NEXT_PUBLIC_API_URL,
    // @ts-expect-error - Check if it's available as a global
    typeof window !== 'undefined' && (window as Record<string, unknown>).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL,
    // Railway production fallback
    'https://catalog-production-0eb1.up.railway.app/api/v1'
  ];
  
  for (const source of sources) {
    if (source && typeof source === 'string' && source.trim()) {
      console.log('✅ Using API URL from source:', source);
      return source.trim();
    }
  }
  
  // Final fallback
  const fallback = 'https://catalog-production-0eb1.up.railway.app/api/v1';
  console.log('⚠️ Using final fallback API URL:', fallback);
  return fallback;
};

export const ENV = {
  API_URL: getApiUrl(),
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Detailed logging for debugging
console.log('🔧 Environment Configuration:', {
  ...ENV,
  'process.env.NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL,
  'process.env.NODE_ENV': process.env.NODE_ENV,
  'typeof window': typeof window,
  'window.location': typeof window !== 'undefined' ? window.location.href : 'N/A'
});

export default ENV;
