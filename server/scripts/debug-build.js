#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging build process...');

// Check if dist directory exists
const distPath = path.join(__dirname, '..', 'dist');
console.log('📁 Checking dist directory:', distPath);

if (fs.existsSync(distPath)) {
  console.log('✅ dist directory exists');
  
  // List contents of dist directory
  const distContents = fs.readdirSync(distPath);
  console.log('📋 dist contents:', distContents);
  
  // Check if main.js exists
  const mainJsPath = path.join(distPath, 'main.js');
  if (fs.existsSync(mainJsPath)) {
    console.log('✅ main.js exists');
    const stats = fs.statSync(mainJsPath);
    console.log('📊 main.js size:', stats.size, 'bytes');
  } else {
    console.log('❌ main.js does not exist');
  }
} else {
  console.log('❌ dist directory does not exist');
}

// Check current working directory
console.log('📍 Current working directory:', process.cwd());

// List files in current directory
const currentDirContents = fs.readdirSync(process.cwd());
console.log('📋 Current directory contents:', currentDirContents);

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('✅ package.json exists');
} else {
  console.log('❌ package.json does not exist');
}
