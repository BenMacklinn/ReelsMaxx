'use client';

import { useState, useRef } from 'react';
import { getVideoUrl } from '@/utils/drive';

interface VideoCardProps {
  fileId: string;
  originalUrl: string;
  index: number;
  caption: string;
  onCaptionChange: (newCaption: string) => void;
  status?: string;
}

export default function VideoCard({ fileId, originalUrl, index, caption, onCaptionChange, status }: VideoCardProps) {
  const [error, setError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = getVideoUrl(fileId);


  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      // Seek to 2 seconds
      videoRef.current.currentTime = 2;
    }
  };

  const handleSeeked = () => {
    // When we finish seeking to 2s, pause the video so it acts as a static thumbnail
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleError = () => {
    // If the direct video stream fails (CORS, 403, etc), fall back to iframe
    setError(true);
  };

  return (
    <div className="flex flex-col gap-3 w-full group relative">
      {/* Video Container - Sharp edges, 9:16 aspect ratio */}
      <div className="aspect-[9/16] bg-black relative w-full overflow-hidden border border-zinc-800 group-hover:border-zinc-700 transition-colors">
        {/*
          Google Drive videos are notoriously hard to embed directly in <video> tags due to CORS and expirable links.
          The most reliable way to show a "thumbnail" or preview is usually the iframe with /preview endpoint.
          However, that often has UI chrome.
          
          If direct <video> fails (which it often does for Drive), we fall back to iframe.
          But even iframes can be blocked by CSP if the drive link is restricted.
        */}
        {error ? (
          <iframe
            src={`https://drive.google.com/file/d/${fileId}/preview`}
            className="w-[120%] h-full border-0 -ml-[10%] scale-102"
            allow="autoplay"
            title="Video Preview"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              preload="auto"
              muted
              playsInline
              onLoadedMetadata={handleLoadedMetadata}
              onSeeked={handleSeeked}
              onError={handleError}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </>
        )}
        
        {/* Index Number Overlay */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none">
          <div className="w-6 h-6 bg-black/50 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white border border-white/10">
            {index}
          </div>
        </div>

        {/* Fullscreen/Link Button */}
        <a 
          href={originalUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-emerald-500 hover:border-emerald-400 hover:text-black transition-all opacity-0 group-hover:opacity-100"
          title="Open in new tab"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>

      {/* Caption Input - Below the video */}
      <textarea
        value={caption}
        onChange={(e) => onCaptionChange(e.target.value)}
        className="w-full h-24 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none placeholder-zinc-700 transition-colors resize-none"
        placeholder="Enter caption..."
      />
    </div>
  );
}
