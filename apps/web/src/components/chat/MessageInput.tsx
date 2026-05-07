'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks';
import { socket } from '@/socket/socket.client';
import EmojiPicker from './EmojiPicker';
import { 
  uploadToCloudinary, 
  generatePreview, 
  validateFile,
  FileWithProgress,
  CloudinaryUploadResult 
} from '@/services/cloudinary.service';

export default function MessageInput() {
  const { activeConversationId, sendMessage } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (!activeConversationId) return;

    if (typingStartTimerRef.current) {
      clearTimeout(typingStartTimerRef.current);
    }
    if (typingStopTimerRef.current) {
      clearTimeout(typingStopTimerRef.current);
    }

    if (!inputValue.trim()) {
      socket.emit('typing:stop', { conversationId: activeConversationId });
      return;
    }

    typingStartTimerRef.current = setTimeout(() => {
      socket.emit('typing:start', { conversationId: activeConversationId });
    }, 300);

    typingStopTimerRef.current = setTimeout(() => {
      socket.emit('typing:stop', { conversationId: activeConversationId });
    }, 1500);

    return () => {
      if (typingStartTimerRef.current) {
        clearTimeout(typingStartTimerRef.current);
      }
      if (typingStopTimerRef.current) {
        clearTimeout(typingStopTimerRef.current);
      }
    };
  }, [inputValue, activeConversationId]);

  useEffect(() => () => {
    if (activeConversationId) {
      socket.emit('typing:stop', { conversationId: activeConversationId });
    }
  }, [activeConversationId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  };

  const handleFileSelect = (newFiles: File | File[]) => {
    const filesArray = Array.isArray(newFiles) ? newFiles : [newFiles];
    const validFiles: FileWithProgress[] = [];
    
    filesArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }
      
      const preview = generatePreview(file) || '';
      validFiles.push({
        file,
        preview,
        progress: 0,
        uploading: false
      });
    });
    
    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => {
      const fileToRemove = prev[index];
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
    // Reset input value to allow selecting same file again
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeConversationId) return;
    if (!inputValue.trim() && files.length === 0) return;
    if (isUploading) return;

    setIsUploading(true);

    try {
      // Upload all files to Cloudinary
      const uploadPromises = files.map((fileWithProgress, index) => 
        uploadToCloudinary(fileWithProgress.file, (progress) => {
          // Update progress for this file
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress, uploading: true } : f
          ));
        }).then(result => ({
          file: fileWithProgress.file,
          result
        }))
      );

      const uploadedResults = await Promise.all(uploadPromises);

      // Map to attachment format
      const attachments = uploadedResults.map(({ file, result }) => ({
        url: result.secure_url,
        type: result.resource_type,
        name: file.name,
        size: file.size,
        format: result.format
      }));

      // Send message with attachments via socket
      const content = inputValue.trim();
      setInputValue('');
      
      // Clean up preview URLs
      files.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setFiles([]);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      socket.emit('typing:stop', { conversationId: activeConversationId });
      
      // Send via socket with attachments
      socket.emit('message:send', {
        conversationId: activeConversationId,
        content: content,
        type: attachments.length > 0 ? (attachments.some(a => a.type === 'image') ? 'image' : 'file') : 'text',
        attachments: attachments.length > 0 ? attachments : undefined,
        clientId: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }, (response: any) => {
        if (!response?.success) {
          console.error('Failed to send message:', response?.message);
        }
      });
    } catch (error) {
      console.error('Failed to upload files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="sticky bottom-0 bg-slate-950/70 backdrop-blur-xl border-t border-white/10 px-4 py-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-end gap-3">
          {/* Input Container with File Chips */}
          <div 
            className={`flex-1 relative bg-slate-950 rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.6)] px-4 py-3 focus-within:border-purple-500/50 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 ${
              isDragging
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/10'
            }`}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileSelect(file);
            }}
          >
            {/* Emoji Picker */}
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              isOpen={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
            />

            <div className="space-y-2">
              {/* File Chips (TOP) */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {files.map((file, index) => {
                    const isImageFile = file.file.type.startsWith('image/');

                    return (
                      <div key={index} className="group relative bg-white/5 border border-white/10 rounded-lg p-2 pr-8 flex items-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-default">
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="absolute top-1 right-1 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Remove file"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        {/* File Preview */}
                        {isImageFile && file.preview ? (
                          <img
                            src={file.preview}
                            alt="Preview"
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition-colors">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}

                        {/* File Info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-white font-medium truncate max-w-[120px]">
                            {file.file.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {(file.file.size / 1024).toFixed(1)} KB
                          </p>
                          
                          {/* Upload Progress */}
                          {file.uploading && (
                            <div className="w-full bg-white/10 rounded-full h-1 mt-1">
                              <div 
                                className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Input Row (BOTTOM) */}
              <div className="flex items-end gap-2">
                {/* Emoji button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-500 hover:text-yellow-400 transition-colors flex-shrink-0 pb-1 hover:scale-110 active:scale-95"
                  aria-label="Add emoji"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                {/* Textarea with auto-resize */}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={!activeConversationId}
                  placeholder={activeConversationId ? 'Type a message...' : 'Select a conversation first'}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-500 resize-none px-2 py-1 max-h-[150px] overflow-y-auto leading-relaxed min-h-[20px]"
                />

                {/* Attach file button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-500 hover:text-purple-400 transition-colors flex-shrink-0 pb-1 hover:scale-110 active:scale-95"
                  aria-label="Attach file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.txt,.md"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={!activeConversationId || isUploading || (!inputValue.trim() && files.length === 0)}
            className="h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2 flex-shrink-0"
          >
            {isUploading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">Uploading...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
