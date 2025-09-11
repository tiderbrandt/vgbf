#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Testing Cloudinary with corrected cloud name:', process.env.CLOUDINARY_CLOUD_NAME);

// Test with a simple API call to validate credentials
cloudinary.api.ping()
  .then(result => {
    console.log('✓ Cloudinary credentials are valid!', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('✗ Cloudinary credentials failed:', error.message);
    process.exit(1);
  });
