// api/upload

import { uploadFile, deleteImage, getPublicIdFromUrl } from '@/libs/cloudinary';
import { ApiResponse, AppError, withErrorHandler } from '@/libs/errorHandler';

export const POST = withErrorHandler(async (req) => {

  const formData = await req.formData();
  const file = formData.get('image');

  if (!file) {
    throw new AppError('No image file provided', 400)
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new AppError('Invalid file type', 400)
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new AppError('File size too large. Maximum 5MB allowed.', 400)
  }


  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to Cloudinary
  const result = (await uploadFile(buffer, 'simpleHR/additionalFile'));

  const data = {
    success: true,
    imageUrl: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    bytes: result.bytes,
    width: result.width,
    height: result.height
  }

  return ApiResponse.success(data, '')
})


// DELETE specific image
export const DELETE = withErrorHandler(async (req) => {

  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    throw new AppError('Image URL is required', 400)
  }

  const publicId = getPublicIdFromUrl(imageUrl);

  if (!publicId) {
    throw new AppError('Invalid Cloudinary URL', 400)
  }

  const result = await deleteImage(publicId);

  return ApiResponse.success({}, 'Image deleted successfully')
})