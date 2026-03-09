const path = require('path');
const supabase = require('../config/supabase');
require('dotenv').config();

const uploadFile = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
  const fileName = `${Date.now()}_${sanitizedOriginalName}`;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'Trespics1';
  console.log(`Using bucket: ${bucketName} for file: ${fileName}`);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  console.log('Generated public URL:', publicUrl);
  return { url: publicUrl, fileName: fileName };
};

module.exports = { uploadFile };
