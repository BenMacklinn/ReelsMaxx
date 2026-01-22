'use client';

import { useState, useEffect, useTransition } from 'react';
import VideoGrid, { VideoItem } from '@/components/VideoGrid';
import { extractFileId } from '@/utils/drive';
import { getVideos, addVideo, updateVideo, deleteVideo } from './actions';

// Helper to format date "Jan 22"
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

// Helper to get date key "2026-01-22"
const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [inputLinks, setInputLinks] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Generate last 7 days
  const [days, setDays] = useState<{ date: Date; key: string; label: string }[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Initialize dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Start from Jan 19, 2026
    const startDate = new Date(2026, 0, 19); // Jan 19, 2026
    
    const tempDays = [];
    let current = new Date(startDate);
    
    // Generate weekdays from Jan 19 up to today
    while (current <= today) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sunday(0) and Saturday(6)
        tempDays.push({
          date: new Date(current),
          key: getDateKey(current),
          label: formatDate(current),
        });
      }
      current.setDate(current.getDate() + 1);
    }
    
    // Show newest first
    tempDays.reverse();
    
    setDays(tempDays);
    if (tempDays.length > 0) {
      setSelectedDateKey(tempDays[0].key);
    }
  }, []);

  // Fetch videos when selected date changes
  useEffect(() => {
    if (selectedDateKey) {
      startTransition(async () => {
        const fetchedVideos = await getVideos(selectedDateKey);
        setVideos(fetchedVideos);
      });
    }
  }, [selectedDateKey]);

  const handleAddVideos = () => {
    if (!inputLinks.trim()) return;

    const lines = inputLinks.split(/\n+/);
    const newVideos: VideoItem[] = [];

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

    // Optimistically update UI
    setVideos(prev => [...prev, ...newVideos]);
    
    // Save to DB
    newVideos.forEach(v => {
      addVideo(selectedDateKey, v);
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

  const handleStatusChange = (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    setVideos(prev => prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v)));
    updateVideo(id, { status: newStatus });
  };

  const handleRemoveVideo = (id: string) => {
    setVideos(prev => prev.filter((v) => v.id !== id));
    deleteVideo(id);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase mb-1">ReelsMaxx</h1>
              <div className="h-1 w-12 bg-emerald-500"></div>
            </div>

            {/* Date Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800"
              >
                <span className="text-xl font-bold text-white uppercase">{days.find(d => d.key === selectedDateKey)?.label}</span>
                <span className={`text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 shadow-xl z-50 py-2">
                    {days.map((day) => (
                      <button
                        key={day.key}
                        onClick={() => {
                          setSelectedDateKey(day.key);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wide hover:bg-zinc-800 transition-colors flex items-center justify-between ${
                          selectedDateKey === day.key ? 'text-emerald-500' : 'text-zinc-400'
                        }`}
                      >
                        {day.label}
                        {selectedDateKey === day.key && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="text-sm font-bold text-zinc-500 uppercase tracking-wide">
            {videos.length} Videos
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8 max-w-[1600px] mx-auto w-full">
        <header className="mb-12">
          <div className="bg-zinc-900/50 p-6 border border-zinc-800/50 backdrop-blur-sm hover:border-emerald-500/20 transition-colors">
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
                  className="px-6 py-2 bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </header>

        <section>
          {isPending ? (
            <div className="text-zinc-500 text-center py-20 font-bold uppercase tracking-wider">Loading...</div>
          ) : (
            <VideoGrid 
              videos={videos} 
              onCaptionChange={handleCaptionChange} 
              onFeedbackChange={handleFeedbackChange}
              onStatusChange={handleStatusChange}
              onRemoveVideo={handleRemoveVideo}
            />
          )}
        </section>
      </main>
    </div>
  );
}
