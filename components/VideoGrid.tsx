import VideoCard from './VideoCard';

export interface VideoItem {
  id: string;
  fileId: string;
  originalUrl: string;
  caption: string;
  feedback: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface VideoGridProps {
  videos: VideoItem[];
  onCaptionChange: (id: string, newCaption: string) => void;
  onFeedbackChange: (id: string, newFeedback: string) => void;
  onStatusChange: (id: string, newStatus: 'pending' | 'approved' | 'rejected') => void;
  onRemoveVideo: (id: string) => void;
}

export default function VideoGrid({ videos, onCaptionChange, onFeedbackChange, onStatusChange, onRemoveVideo }: VideoGridProps) {
  // Get first 4 videos or create placeholders
  const video1 = videos[0] || null;
  const video2 = videos[1] || null;
  const video3 = videos[2] || null;
  const video4 = videos[3] || null;

  const renderVideoColumn = (video: VideoItem | null, index: number) => (
    <div className="w-full md:w-1/4">
      {video ? (
        <div className="relative group/wrapper">
          <VideoCard
            fileId={video.fileId}
            originalUrl={video.originalUrl}
            caption={video.caption}
            index={index}
            onCaptionChange={(val) => onCaptionChange(video.id, val)} 
          />
          <button
            onClick={() => onRemoveVideo(video.id)}
            className="absolute -top-3 -right-3 w-7 h-7 bg-zinc-900 border border-red-500/50 flex items-center justify-center text-red-500 hover:text-red-400 hover:border-red-400 hover:bg-zinc-800 transition-all z-20 shadow-lg"
            title="Remove video"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="aspect-[9/16] w-full bg-zinc-900/20 border border-zinc-800/50 flex flex-col items-center justify-center">
          <span className="text-zinc-800 font-medium">Slot {index}</span>
        </div>
      )}
    </div>
  );

  const renderCommentColumn = (video: VideoItem | null) => (
    <div className="w-full md:w-1/4 flex flex-col h-full gap-3">
      <div className="flex-1 flex flex-col min-h-[400px] bg-zinc-900/30 border border-zinc-800/50 overflow-hidden p-1 transition-colors focus-within:border-emerald-500/50 focus-within:bg-zinc-900/50 focus-within:ring-1 focus-within:ring-emerald-500/20">
        <textarea
          value={video?.feedback || ''}
          onChange={(e) => video && onFeedbackChange(video.id, e.target.value)}
          disabled={!video}
          className="w-full h-full bg-transparent p-4 text-sm text-zinc-300 focus:outline-none resize-none placeholder-zinc-700"
          placeholder={video ? "Add feedback..." : ""}
        />
      </div>
      <div className="h-10 flex">
        <button
          disabled={!video}
          onClick={() => video && onStatusChange(video.id, video.status === 'approved' ? 'pending' : 'approved')}
          className={`w-full font-medium text-sm transition-all flex items-center justify-center gap-2 border h-full
            ${video?.status === 'approved' 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
              : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-400 disabled:opacity-50 disabled:hover:border-zinc-800 disabled:hover:text-zinc-500'
            }`}
        >
          {video?.status === 'approved' ? (
            <>
              <span className="text-lg">✓</span>
              APPROVED
            </>
          ) : (
            "APPROVE"
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Row 1 */}
      <div className="flex flex-col md:flex-row gap-6">
        {renderVideoColumn(video1, 1)}
        {renderCommentColumn(video1)}
        {renderVideoColumn(video2, 2)}
        {renderCommentColumn(video2)}
      </div>

      {/* Row 2 */}
      <div className="flex flex-col md:flex-row gap-6">
        {renderVideoColumn(video3, 3)}
        {renderCommentColumn(video3)}
        {renderVideoColumn(video4, 4)}
        {renderCommentColumn(video4)}
      </div>
    </div>
  );
}
