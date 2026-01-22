'use server';

import { supabase } from '@/utils/supabase';
import { VideoItem } from '@/components/VideoGrid';

export async function getVideos(dateKey: string): Promise<VideoItem[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('date_key', dateKey)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }

  // Map DB fields to camelCase if necessary, assuming DB columns are snake_case
  // But to keep it simple, I'll assume we create the table with mixed case or handle mapping here.
  // Let's stick to camelCase in DB or map it.
  // Actually, Supabase returns what is in the DB.
  // Let's assume the user creates columns matching the JSON properties or we map them.
  // Mapping is safer.
  
  return data.map((row: any) => ({
    id: row.id,
    fileId: row.file_id,
    originalUrl: row.original_url,
    caption: row.caption || '',
    feedback: row.feedback || '',
    status: row.status || 'pending',
  }));
}

export async function addVideo(dateKey: string, video: VideoItem) {
  const { error } = await supabase
    .from('videos')
    .insert({
      id: video.id,
      date_key: dateKey,
      file_id: video.fileId,
      original_url: video.originalUrl,
      caption: video.caption,
      feedback: video.feedback,
      status: video.status,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error adding video:', error);
    throw new Error('Failed to add video');
  }
}

export async function updateVideo(id: string, updates: Partial<VideoItem>) {
  // Convert camelCase to snake_case for DB
  const dbUpdates: any = {};
  if (updates.caption !== undefined) dbUpdates.caption = updates.caption;
  if (updates.feedback !== undefined) dbUpdates.feedback = updates.feedback;
  if (updates.status !== undefined) dbUpdates.status = updates.status;

  const { error } = await supabase
    .from('videos')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error('Error updating video:', error);
    throw new Error('Failed to update video');
  }
}

export async function deleteVideo(id: string) {
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting video:', error);
    throw new Error('Failed to delete video');
  }
}
