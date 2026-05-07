'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
      setIsDragOver(false);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
        isDragActive
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-white/10 hover:border-white/20 hover:bg-white/5'
      }`}
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={() => setIsDragOver(false)}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-2">
        <svg
          className="w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3"
          />
        </svg>
        
        {isDragActive ? (
          <p className="text-sm text-purple-400 font-medium">Drop the file here...</p>
        ) : (
          <>
            <p className="text-sm text-gray-400">
              Drag & drop a file here, or{' '}
              <span className="text-purple-400">click to browse</span>
            </p>
            <p className="text-xs text-gray-500">
              Images, PDF, Text (max 10MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
