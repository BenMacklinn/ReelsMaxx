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
  // Get first 6 videos or create placeholders
  const videoSlots = [0, 1, 2, 3, 4, 5].map(i => ({
    video: videos[i] || null,
    index: i + 1
  }));

  const renderVideoGroup = (video: VideoItem | null, index: number) => (
    <div className="w-full md:w-1/2 xl:w-1/3 px-12 mb-6 xl:mb-0">
      <div className="h-full border border-zinc-800/50 bg-zinc-900/20 p-4 flex flex-col gap-4 hover:border-zinc-700/50 transition-colors">
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
              <span className="text-white font-medium">Slot {index}</span>
            </div>
          )}
        </div>

        {/* Feedback Column */}
        <div className="w-full flex flex-col gap-3 flex-1">
          <div className="flex-1 flex flex-col min-h-[150px] bg-zinc-900/30 border border-zinc-800/50 overflow-hidden p-1 transition-colors focus-within:border-emerald-500/50 focus-within:bg-zinc-900/50 focus-within:ring-1 focus-within:ring-emerald-500/20">
            <textarea
              value={video?.feedback || ''}
              onChange={(e) => video && onFeedbackChange(video.id, e.target.value)}
              disabled={!video}
              className="w-full h-full bg-transparent p-4 text-sm text-zinc-300 focus:outline-none resize-none placeholder-zinc-400"
              placeholder={video ? "Enter feedback..." : ""}
            />
          </div>
          <div className="h-10 flex shrink-0">
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
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-18 pb-20 scale-80 origin-top">
      {/* Row 1 */}
      <div className="flex flex-wrap -mx-12 gap-y-12">
        {renderVideoGroup(videoSlots[0].video, 1)}
        {renderVideoGroup(videoSlots[1].video, 2)}
        {renderVideoGroup(videoSlots[2].video, 3)}
      </div>

      {/* Row 2 */}
      <div className="flex flex-wrap -mx-12 gap-y-12">
        {renderVideoGroup(videoSlots[3].video, 4)}
        {renderVideoGroup(videoSlots[4].video, 5)}
        {renderVideoGroup(videoSlots[5].video, 6)}
      </div>
    </div>
  );
}
