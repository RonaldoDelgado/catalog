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
      try {
        const buildOutput = await execPromise('npm run build');
        console.log('✅ Build completed');
        console.log('Build stdout:', buildOutput.stdout);
        if (buildOutput.stderr) {
          console.log('Build stderr:', buildOutput.stderr);
        }
      } catch (buildError) {
        console.error('❌ Build failed:', buildError.message);
        if (buildError.stdout) console.log('Build stdout:', buildError.stdout);
        if (buildError.stderr) console.log('Build stderr:', buildError.stderr);
        throw buildError;
      }
    } else {
      console.log('✅ Build already exists, skipping...');
    }
    
    // Debug: Show what's in dist
    console.log('🔍 Debugging build output...');
    try {
      const debugOutput = await execPromise('npm run debug:build');
      console.log('Debug output:', debugOutput.stdout);
    } catch (debugError) {
      console.log('Debug script error:', debugError.message);
    }
    
    // Manual check of dist directory
    console.log('🔍 Manual check of dist directory...');
    if (fs.existsSync(distPath)) {
      console.log('✅ dist directory exists');
      const distContents = fs.readdirSync(distPath);
      console.log('📋 dist contents:', distContents);
      
      if (fs.existsSync(mainJsPath)) {
        const stats = fs.statSync(mainJsPath);
        console.log('✅ main.js exists, size:', stats.size, 'bytes');
      } else {
        console.log('❌ main.js does not exist in dist');
      }
    } else {
      console.log('❌ dist directory does not exist');
    }
    
    console.log('🚀 Starting production server...');
    // Start the application with absolute path
    const mainPath = path.join(__dirname, '..', 'dist', 'main.js');
    console.log('📍 Looking for main.js at:', mainPath);
    require(mainPath);
    
  } catch (error) {
    console.error('❌ Error during startup:', error.message);
    
    // If build fails, try to build again
    console.log('🔄 Retrying build...');
    try {
      await execPromise('npm run build');
      console.log('✅ Retry build completed');
      const mainPath = path.join(__dirname, '..', 'dist', 'main.js');
      console.log('📍 Retry: Looking for main.js at:', mainPath);
      require(mainPath);
    } catch (retryError) {
      console.error('❌ Retry failed:', retryError.message);
      process.exit(1);
    }
  }
}

startWithBuild();
