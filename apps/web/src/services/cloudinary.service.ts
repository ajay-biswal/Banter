export interface CloudinaryUploadResult {
  secure_url: string;
  resource_type: string;
  format: string;
  public_id: string;
  bytes: number;
}

export interface FileWithProgress {
  file: File;
  preview: string;
  progress: number;
  uploading: boolean;
  uploaded?: boolean;
  error?: string;
  result?: CloudinaryUploadResult;
}

/**
 * Upload file directly to Cloudinary from frontend
 * Uses XMLHttpRequest for progress tracking
 */
export const uploadToCloudinary = (
  file: File,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      reject(new Error('Cloudinary env not configured'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
    );

    // Track upload progress
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          secure_url: response.secure_url,
          resource_type: response.resource_type,
          format: response.format,
          public_id: response.public_id,
          bytes: response.bytes
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload'));
    };

    xhr.send(formData);
  });
};

/**
 * Generate preview URL for file
 */
export const generatePreview = (file: File): string | null => {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }
  return null;
};

/**
 * Validate file before upload
 */
export const validateFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'application/pdf'
  ];

  if (file.size > maxSize) {
    return 'File size must be less than 10MB';
  }

  if (!allowedTypes.includes(file.type)) {
    return 'File type not supported. Allowed: images, PDF, MP4';
  }

  return null;
};
