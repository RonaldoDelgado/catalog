#!/usr/bin/env node

// Script to check and log environment variables before build
console.log('🔍 Checking environment variables...');

// Log all environment variables that start with NEXT_PUBLIC_
const nextPublicVars = Object.keys(process.env)
  .filter(key => key.startsWith('NEXT_PUBLIC_'))
  .reduce((obj, key) => {
    obj[key] = process.env[key];
    return obj;
  }, {});

console.log('📋 NEXT_PUBLIC_ variables found:', nextPublicVars);

// Check specific variables
const requiredVars = ['NEXT_PUBLIC_API_URL'];
const missingVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.log(`❌ Missing: ${varName}`);
  } else {
    console.log(`✅ Found: ${varName} = ${process.env[varName]}`);
  }
});

if (missingVars.length > 0) {
  console.log('⚠️ Some environment variables are missing, but build will continue with fallbacks.');
} else {
  console.log('✅ All required environment variables are present.');
}

console.log('🏁 Environment check complete.');
