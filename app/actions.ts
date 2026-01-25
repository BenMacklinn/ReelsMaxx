'use server';

import { supabase } from '@/utils/supabase';
import { VideoItem } from '@/components/VideoGrid';

export async function getVideosPaginated(offset: number, limit: number, showPosted: boolean = false): Promise<VideoItem[]> {
  console.log(`Fetching videos offset: ${offset}, limit: ${limit}, showPosted: ${showPosted}`);
  
  let query = supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (showPosted) {
    query = query.eq('status', 'posted');
  } else {
    query = query.neq('status', 'posted');
  }
    
  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    fileId: row.file_id,
    originalUrl: row.original_url,
    caption: row.caption || '',
    feedback: row.feedback || '',
    status: row.status || 'pending',
  }));
}

export async function getVideos(dateKey: string): Promise<VideoItem[]> {
  console.log(`Fetching videos for date: ${dateKey}`);
  
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('date_key', dateKey)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }

  console.log(`Found ${data?.length || 0} videos for ${dateKey}`);

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
  console.log(`Adding video to ${dateKey}:`, video.id);

  const payload = {
    id: video.id,
    date_key: dateKey,
    file_id: video.fileId,
    original_url: video.originalUrl,
    caption: video.caption,
    feedback: video.feedback,
    status: video.status,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('videos')
    .insert(payload)
    .select();

  if (error) {
    console.error('SERVER ERROR adding video:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to add video: ${error.message}`);
  }
  
  console.log('Successfully added video:', data);
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
