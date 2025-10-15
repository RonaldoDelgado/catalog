#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const execPromise = util.promisify(exec);

async function startWithBuild() {
  try {
    console.log('🔍 Checking if build is needed...');
    
    // Check if dist directory exists and has main.js
    const distPath = path.join(__dirname, '..', 'dist');
    const mainJsPath = path.join(distPath, 'main.js');
    
    if (!fs.existsSync(mainJsPath)) {
      console.log('📦 Building application...');
      await execPromise('npm run build');
      console.log('✅ Build completed');
    } else {
      console.log('✅ Build already exists, skipping...');
    }
    
    // Debug: Show what's in dist
    console.log('🔍 Debugging build output...');
    await execPromise('npm run debug:build');
    
    console.log('🚀 Starting production server...');
    // Start the application
    require('../dist/main.js');
    
  } catch (error) {
    console.error('❌ Error during startup:', error.message);
    
    // If build fails, try to build again
    console.log('🔄 Retrying build...');
    try {
      await execPromise('npm run build');
      console.log('✅ Retry build completed');
      require('../dist/main.js');
    } catch (retryError) {
      console.error('❌ Retry failed:', retryError.message);
      process.exit(1);
    }
  }
}

startWithBuild();
