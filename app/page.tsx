'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import VideoGrid, { VideoItem } from '@/components/VideoGrid';
import { extractFileId } from '@/utils/drive';
import { getVideosPaginated, addVideo, updateVideo, deleteVideo } from './actions';

// Helper to get date key "2026-01-22"
const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [inputLinks, setInputLinks] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, startLoadMoreTransition] = useTransition();
  
  // Pagination state
  const LIMIT = 6;
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Initial load
    loadMoreVideos(0);
  }, []);

  const loadMoreVideos = (currentOffset: number) => {
    startTransition(async () => {
      const fetchedVideos = await getVideosPaginated(currentOffset, LIMIT);
      
      if (fetchedVideos.length < LIMIT) {
        setHasMore(false);
      }

      if (currentOffset === 0) {
        setVideos(fetchedVideos);
      } else {
        setVideos(prev => [...prev, ...fetchedVideos]);
      }
      
      setOffset(currentOffset + LIMIT);
    });
  };

  const handleLoadMore = () => {
    startLoadMoreTransition(async () => {
      const fetchedVideos = await getVideosPaginated(offset, LIMIT);
      
      if (fetchedVideos.length < LIMIT) {
        setHasMore(false);
      }

      setVideos(prev => [...prev, ...fetchedVideos]);
      setOffset(prev => prev + LIMIT);
    });
  };

  const handleAddVideos = () => {
    if (!inputLinks.trim()) return;

    const lines = inputLinks.split(/\n+/);
    const newVideos: VideoItem[] = [];
    const todayKey = getDateKey(new Date());

    lines.forEach((line) => {
      const url = line.trim();
      if (!url) return;

      const fileId = extractFileId(url);
      if (fileId) {
        newVideos.push({
          id: `${fileId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fileId,
          originalUrl: url,
          caption: '',
          feedback: '',
          status: 'pending',
        });
      }
    });

    // Optimistically update UI - add to top
    setVideos(prev => [...newVideos, ...prev]);
    
    // Save to DB
    newVideos.forEach(v => {
      addVideo(todayKey, v);
    });
    
    setInputLinks('');
  };

  const handleCaptionChange = (id: string, newCaption: string) => {
    setVideos(prev => prev.map((v) => (v.id === id ? { ...v, caption: newCaption } : v)));
    updateVideo(id, { caption: newCaption });
  };

  const handleFeedbackChange = (id: string, newFeedback: string) => {
    setVideos(prev => prev.map((v) => (v.id === id ? { ...v, feedback: newFeedback } : v)));
    updateVideo(id, { feedback: newFeedback });
  };

  const handleStatusChange = (id: string, newStatus: 'pending' | 'approved' | 'rejected' | 'posted') => {
    setVideos(prev => prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v)));
    updateVideo(id, { status: newStatus });
  };

  const handleRemoveVideo = (id: string) => {
    setVideos(prev => prev.filter((v) => v.id !== id));
    deleteVideo(id);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-0 md:h-20 flex flex-col md:flex-row items-center justify-between relative gap-4 md:gap-0">
          
          {/* Left: Branding */}
          <div className="flex items-center justify-between w-full md:w-auto md:justify-start gap-4 md:gap-12 z-20">
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase mb-1">ReelsMaxx</h1>
              <div className="h-1 w-12 bg-emerald-500"></div>
            </div>
          </div>

          {/* Center: Logo */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-4">
            <Image 
              src="/logo.png" 
              alt="ReelsMaxx Logo" 
              width={140} 
              height={90} 
              className="rounded-full"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-between w-full md:w-auto md:justify-start gap-4 md:gap-6 z-10">
            <div className="text-sm font-bold text-zinc-500 uppercase tracking-wide order-1 md:order-none">
              {videos.length} Videos Loaded
            </div>
            <button
              onClick={() => setShowImport(!showImport)}
              className={`flex-1 md:flex-none order-2 md:order-none px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border ${
                showImport 
                  ? 'bg-emerald-500 text-black border-emerald-500' 
                  : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {showImport ? 'Close' : 'Import Videos'}
            </button>
          </div>
        </div>
      </nav>

      {showImport && (
        <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8 sticky top-32 md:top-20 z-40 bg-zinc-950 pt-4 md:pt-8 pb-4 border-b border-transparent transition-all">
          <div className="bg-zinc-900/50 p-6 border border-zinc-800/50 backdrop-blur-sm hover:border-emerald-500/20 transition-colors shadow-2xl">
              <div className="flex justify-between items-end mb-4">
                <label 
                  htmlFor="video-links" 
                  className="text-sm font-bold text-emerald-500 uppercase tracking-wide"
                >
                  Add Video Links
                </label>
                <span className="text-xs text-zinc-500">
                  Supports Google Drive Links
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="video-links"
                  value={inputLinks}
                  onChange={(e) => setInputLinks(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddVideos();
                    }
                  }}
                  className="w-full h-14 pl-4 pr-40 bg-zinc-950/50 border border-zinc-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm text-zinc-200 placeholder-zinc-600 transition-all"
                  placeholder="Paste Google Drive link here..."
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <button
                    onClick={handleAddVideos}
                    disabled={!inputLinks.trim()}
                    className="px-4 md:px-6 py-2 bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-20">
        <section className="mb-8">
            <VideoGrid 
              videos={videos} 
              onCaptionChange={handleCaptionChange} 
              onFeedbackChange={handleFeedbackChange}
              onStatusChange={handleStatusChange}
              onRemoveVideo={handleRemoveVideo}
            />
        </section>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center pb-20">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore || isPending}
              className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? 'Loading...' : 'Load More Videos'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
