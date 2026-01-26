import React from 'react';
import VideoCard from './VideoCard';
import { notifyBen } from '@/app/actions';

export interface VideoItem {
  id: string;
  fileId: string;
  originalUrl: string;
  caption: string;
  feedback: string;
  status: 'pending' | 'approved' | 'rejected' | 'posted';
}

interface VideoGridProps {
  videos: VideoItem[];
  onCaptionChange: (id: string, newCaption: string) => void;
  onFeedbackChange: (id: string, newFeedback: string) => void;
  onStatusChange: (id: string, newStatus: 'pending' | 'approved' | 'rejected' | 'posted') => void;
  onRemoveVideo: (id: string) => void;
}

export default function VideoGrid({ videos, onCaptionChange, onFeedbackChange, onStatusChange, onRemoveVideo }: VideoGridProps) {
  // Ensure at least 6 slots, but grow if we have more videos
  const totalSlots = Math.max(videos.length, 6);
  const videoSlots = Array.from({ length: totalSlots }).map((_, i) => ({
    video: videos[i] || null,
    index: i + 1
  }));

  const renderVideoGroup = (video: VideoItem | null, index: number) => {
    const isApproved = video?.status === 'approved' || video?.status === 'posted';
    const isPosted = video?.status === 'posted';
    const [notified, setNotified] = React.useState(false);

    return (
    <div key={index} className="w-full md:w-1/2 xl:w-1/3 px-12 mb-12">
      <div className="h-full border border-zinc-800 bg-zinc-900/20 p-4 flex flex-col gap-4 hover:border-zinc-700 transition-colors relative">
        {/* Video Column */}
        <div className="w-full">
          {video ? (
            <div className="relative group/wrapper">
              <VideoCard
                fileId={video.fileId}
                originalUrl={video.originalUrl}
                caption={video.caption}
                index={index}
                onCaptionChange={(val) => onCaptionChange(video.id, val)}
                status={video.status}
              />
              <button
                onClick={() => onRemoveVideo(video.id)}
                className="absolute -top-3 -right-3 w-7 h-7 bg-zinc-900 border border-white/50 flex items-center justify-center text-red-500 hover:text-red-400 hover:border-red-400 hover:bg-zinc-800 transition-all z-20 shadow-lg"
                title="Remove video"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="aspect-[9/16] w-full bg-zinc-900/20 border border-zinc-800 flex flex-col items-center justify-center">
              <span className="text-white font-medium">Slot {index}</span>
            </div>
          )}
        </div>

        {/* Feedback Column */}
        <div className="w-full flex flex-col gap-3 flex-1">
          <div className="flex-1 flex flex-col min-h-[150px] bg-zinc-900/30 border border-zinc-800 overflow-hidden p-1 transition-colors focus-within:border-emerald-500/50 focus-within:bg-zinc-900/50 focus-within:ring-1 focus-within:ring-emerald-500/20">
            <textarea
              value={video?.feedback || ''}
              onChange={(e) => video && onFeedbackChange(video.id, e.target.value)}
              disabled={!video}
              className="w-full h-full bg-transparent p-4 text-sm text-zinc-300 focus:outline-none resize-none placeholder-zinc-400"
              placeholder={video ? "Enter feedback..." : ""}
            />
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              disabled={!video}
              onClick={() => video && onStatusChange(video.id, isApproved ? 'pending' : 'approved')}
              className={`w-full font-medium text-sm transition-all flex items-center justify-center gap-2 border h-10 relative z-20
                ${isApproved 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                  : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-400 disabled:opacity-50 disabled:hover:border-zinc-800 disabled:hover:text-zinc-500'
                }`}
            >
              {isApproved ? (
                <>
                  <span className="text-lg">✓</span>
                  APPROVED
                </>
              ) : (
                "APPROVE"
              )}
            </button>
            <button
              disabled={!video}
              onClick={() => video && onStatusChange(video.id, isPosted ? 'approved' : 'posted')}
              className={`w-full font-medium text-sm transition-all flex items-center justify-center gap-2 border h-10 relative z-20
                ${isPosted 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                  : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-400 disabled:opacity-50 disabled:hover:border-zinc-800 disabled:hover:text-zinc-500'
                }`}
            >
              {isPosted ? (
                <>
                  <span className="text-lg">✓</span>
                  POSTED
                </>
              ) : (
                "POSTED"
              )}
            </button>
            <button
              disabled={!video}
              onClick={async () => {
                if (!video) return;
                const res = await notifyBen(video.caption || 'No caption', video.feedback || '');
                if (res.success) {
                  setNotified(true);
                  alert('SMS sent to Ben!');
                } else {
                  alert('Failed to send SMS: ' + res.error);
                }
              }}
              className={`w-full font-medium text-sm transition-all flex items-center justify-center gap-2 border h-10 relative z-20 bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-400 disabled:opacity-50 disabled:hover:border-zinc-800 disabled:hover:text-zinc-500`}
            >
              {notified ? 'NOTIFIED' : 'NOTIFY BEN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  };

  return (
    <div className="flex flex-wrap -mx-12 -mb-96 scale-80 origin-top pb-0">
      {videoSlots.map(slot => renderVideoGroup(slot.video, slot.index))}
    </div>
  );
}
