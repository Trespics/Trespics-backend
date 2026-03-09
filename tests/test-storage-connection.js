const supabase = require('../src/config/supabase');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testStorage() {
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'trespics';
  console.log(`Using bucket: ${bucketName}`);

  // 1. Check if bucket exists
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error('Error listing buckets:', bucketError);
    return;
  }

  const bucketExists = buckets.some(b => b.name === bucketName);
  if (!bucketExists) {
    console.error(`Bucket "${bucketName}" not found. Available buckets:`, buckets.map(b => b.name));
    return;
  }
  console.log(`Bucket "${bucketName}" exists.`);

  // 2. Try to list files
  const { data: files, error: listError } = await supabase.storage
    .from(bucketName)
    .list('', { limit: 10 });

  // 3. Try to upload a small test file
  const testFileName = `test_${Date.now()}.txt`;
  const testContent = 'Hello from test script';
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(testFileName, Buffer.from(testContent), {
      contentType: 'text/plain',
      upsert: true
    });

  if (uploadError) {
    console.error('Error uploading test file:', uploadError);
    return;
  }
  console.log(`Successfully uploaded test file: ${testFileName}`);

  // 4. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(testFileName);
  
  console.log(`Public URL: ${publicUrl}`);
}

testStorage();
