import { http } from '@/services/http';

export interface UploadedFile {
  url: string;
  type: string;
  name: string;
  size: number;
}

export const uploadService = {
  uploadFiles: async (files: File[]): Promise<UploadedFile[]> => {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await http.post('/upload/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return (response.data as any).files;
  }
};
