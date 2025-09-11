#!/usr/bin/env node
console.log('Testing Cloudinary import...');

try {
  // Test if we can import cloudinary
  const cloudinary = require('cloudinary').v2;
  console.log('✓ Cloudinary imported successfully');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  // Test if env vars are available
  const envVars = {
    cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasKey: !!process.env.CLOUDINARY_API_KEY,
    hasSecret: !!process.env.CLOUDINARY_API_SECRET,
    cloudNameValue: process.env.CLOUDINARY_CLOUD_NAME,
  };
  console.log('Environment variables:', envVars);
  
  // Test if we can configure cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✓ Cloudinary configured successfully');
  
  // Test a simple upload with a small buffer
  const testBuffer = Buffer.from('test image data', 'utf8');
  
  console.log('Testing upload to Cloudinary...');
  cloudinary.uploader.upload_stream(
    {
      folder: 'vgbf/test',
      resource_type: 'raw'
    },
    (error, result) => {
      if (error) {
        console.error('✗ Cloudinary upload failed:', error);
        process.exit(1);
      } else {
        console.log('✓ Cloudinary upload test passed:', result?.secure_url);
        process.exit(0);
      }
    }
  ).end(testBuffer);
  
} catch (error) {
  console.error('✗ Cloudinary test failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
