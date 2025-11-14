// components/CloudinaryFileUpload.js
'use client';

import { useToast } from '../context/toastContext';
import { useState, useRef } from 'react';
import { FiFileText, FiUpload, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

export default function CloudinaryFileUpload({
  value = '',
  onChange,
  folder = 'additionalFile',
  maxSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  label = "Additional Documents",
  description = "Doctors report if necessary for sick leave (optional)."
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const deleteExistingProject = async (imageUrl) => {
    // Get the image URL from formData using .get() method
    if (!imageUrl || !imageUrl.includes('cloudinary')) {
      addToast('No Cloudinary image to delete', 'error');
    }

    const response = await fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      addToast('Failed to delete old image', 'error');
    }

    return response.json();
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      if (formData.image && formData.image.includes('cloudinary')) {
        try {
          await deleteExistingProject(formData.image);
        } catch (error) {
          return error
          // Continue with removal even if deletion fails
        }
      }

      // Simulate upload progress (in real implementation, you'd use axios with onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        addToast(errorData.message || 'Upload failed', 'error');
      }

      const result = await response.json();

      if (result.success) {
        setUploadProgress(100);
        onChange(result.data.imageUrl);

        // Reset progress after success
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        addToast(result.message || 'Upload failed', 'error');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = async (url) => {
    // If there's an existing image from Cloudinary, delete it
    if (url && url.includes('cloudinary')) {
      try {
        await deleteExistingProject(url);
      } catch (error) {
        return error
        // Continue with removal even if deletion fails
      }
    }

    onChange('');
    setError('');
    setUploadProgress(0);
  };

  const handleRetry = () => {
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileTypeIcon = (url) => {
    if (!url) return <FiFileText className="text-gray-400" size={20} />;

    if (url.includes('.pdf')) {
      return <FiFileText className="text-red-500" size={20} />;
    } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <FiFileText className="text-blue-500" size={20} />;
    } else {
      return <FiFileText className="text-gray-500" size={20} />;
    }
  };

  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split('/').pop() || 'Uploaded file';
    } catch {
      return 'Uploaded file';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* File Input */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={allowedTypes.join(',')}
          disabled={uploading}
          className="hidden"
        />

        {!value ? (
          /* Upload Area */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`w-full pl-10 pr-4 py-3 border-2 border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${uploading
              ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
              : error
                ? 'border-red-300 bg-red-50 hover:bg-red-100'
                : 'border-gray-300 bg-white hover:border-teal-400 hover:bg-teal-50'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`${uploading ? 'text-gray-400' : error ? 'text-red-400' : 'text-gray-400'}`}>
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiUpload size={20} />
                )}
              </div>
              <div className="text-left">
                <p className={`text-sm font-medium ${uploading ? 'text-gray-600' : error ? 'text-red-700' : 'text-gray-700'
                  }`}>
                  {uploading ? 'Uploading...' : error ? 'Upload Failed - Click to retry' : 'Click to upload file'}
                </p>
                <p className="text-xs text-gray-500">
                  {allowedTypes.map(type => type.split('/')[1]).join(', ')} • Max {(maxSize / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
            </div>
          </button>
        ) : (
          /* File Preview */
          <div className="w-full p-4 border border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileTypeIcon(value)}
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {getFileNameFromUrl(value)}
                  </p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <FiCheck size={12} />
                    Successfully uploaded
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile(value)}
                className="p-1 text-gray-400 cursor-pointer hover:text-red-600 transition-colors"
                title="Remove file"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && uploadProgress > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <FiAlertCircle size={16} />
              <p className="text-sm">{error}</p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>

      {/* File Preview for Images */}
      {value && value.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
        <div className="mt-3">
          <p className="text-xs text-gray-600 mb-2">Preview:</p>
          <div className="border border-gray-200 rounded-lg p-2 bg-white">
            <img
              src={value}
              alt="Uploaded document preview"
              className="max-h-32 mx-auto object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}