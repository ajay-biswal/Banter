'use client';

import { useState } from 'react';

interface UserInfoPanelProps {
  user: {
    _id: string;
    name: string;
    email: string;
    status?: 'online' | 'offline';
    role?: string;
    avatar?: string;
  } | null;
  onClose?: () => void;
}

export default function UserInfoPanel({ user, onClose }: UserInfoPanelProps) {
  const [showPanel, setShowPanel] = useState(true);

  if (!user) {
    return (
      <div className="hidden lg:flex w-[300px] bg-slate-900 border-l border-white/10 flex-shrink-0 items-center justify-center">
        <p className="text-gray-500 text-sm">Select a conversation</p>
      </div>
    );
  }

  const isOnline = user.status === 'online';

  // Mock shared media (replace with real data later)
  const sharedMedia = [
    { id: 1, url: '/placeholder1.jpg', type: 'image' },
    { id: 2, url: '/placeholder2.jpg', type: 'image' },
    { id: 3, url: '/placeholder3.jpg', type: 'image' },
  ];

  return (
    <div
      className={`hidden lg:flex flex-col bg-slate-900 border-l border-white/10 flex-shrink-0 transition-all duration-300 ease-in-out ${
        showPanel ? 'w-[300px]' : 'w-0'
      } overflow-hidden`}
    >
      <div className="w-[300px] flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-semibold text-sm">Profile</h3>
          <button
            onClick={() => setShowPanel(false)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Section */}
          <div className="p-6 flex flex-col items-center border-b border-white/10">
            {/* Avatar */}
            <div className="relative mb-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-semibold ${
                  isOnline
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    : 'bg-gradient-to-br from-slate-600 to-slate-700'
                }`}
              >
                {user.avatar || user.name.charAt(0).toUpperCase()}
              </div>
              {/* Online indicator */}
              {isOnline && (
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-3 border-slate-900" />
              )}
            </div>

            {/* Name */}
            <h2 className="text-white font-bold text-lg mb-1">{user.name}</h2>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-500'}`} />
              <span className={`text-xs ${isOnline ? 'text-emerald-400' : 'text-gray-500'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 grid grid-cols-3 gap-2 border-b border-white/10">
            <button className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 group">
              <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs text-gray-400">Message</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 group">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
              <span className="text-xs text-gray-400">Mute</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white/5 hover:bg-red-500/10 transition-all duration-200 group">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span className="text-xs text-gray-400">Block</span>
            </button>
          </div>

          {/* Info Section */}
          <div className="p-4 space-y-3 border-b border-white/10">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Info</h4>
            
            {/* Email */}
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-white truncate">{user.email}</p>
              </div>
            </div>

            {/* Role */}
            {user.role && (
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm text-white">{user.role}</p>
                </div>
              </div>
            )}

            {/* Local Time */}
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Local Time</p>
                <p className="text-sm text-white">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Shared Media */}
          <div className="p-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Shared Media</h4>
            <div className="grid grid-cols-3 gap-2">
              {sharedMedia.map((media) => (
                <div
                  key={media.id}
                  className="aspect-square rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer overflow-hidden"
                >
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
