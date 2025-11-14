// app/libs
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadFile(buffer, folder = 'additionalFile') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `simpleHR/${folder}`,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteImage(publicId) {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      throw new Error(`Failed to delete image: ${result.result}`);
    }

    console.log('Successfully deleted image:', publicId);
    return result;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    throw error;
  }
}

export function getPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // Handle different Cloudinary URL formats
    const patterns = [
      /\/v\d+\/(.+)\.\w+$/, // Standard format
      /\/image\/upload\/.*\/(.+)\.\w+$/, // With transformations
      /cloudinary\.com\/.*\/upload\/(.+)\.\w+$/ // Full URL
    ];

    for (const pattern of patterns) {
      const matches = url.match(pattern);
      if (matches && matches[1]) {
        // Remove version number if present
        return matches[1].replace(/^v\d+\//, '');
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', url, error);
    return null;
  }
}

export function getOptimizedFileUrl(publicId, options) {
  const { width, height, quality = 'auto', format = 'auto' } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality,
    format,
    fetch_format: 'auto'
  });
}

export function isCloudinaryUrl(url) {
  return url && typeof url === 'string' && url.includes('cloudinary');
}

// Helper to validate file before upload
export function validateFile(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  } = options;

  const errors = [];

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed.`);
  }

  if (file.size > maxSize) {
    errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(1)}MB.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}