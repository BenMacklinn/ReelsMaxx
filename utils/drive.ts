export function extractFileId(url: string): string | null {
  try {
    const u = new URL(url);
    
    // Pattern 1: /file/d/FILE_ID/view
    if (u.pathname.includes('/file/d/')) {
      const parts = u.pathname.split('/');
      const index = parts.indexOf('d');
      if (index !== -1 && index + 1 < parts.length) {
        return parts[index + 1];
      }
    }

    // Pattern 2: ?id=FILE_ID
    if (u.searchParams.has('id')) {
      return u.searchParams.get('id');
    }

    // Fallback regex for other formats if needed, or refine above
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    const matchId = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1]) {
      return matchId[1];
    }

    return null;
  } catch (e) {
    // Handle invalid URLs gracefully
    console.warn("Invalid URL:", url);
    return null;
  }
}

export function getVideoUrl(fileId: string): string {
  // Use the export=download format which often redirects to a playable stream or works in <video> tag 
  // depending on permissions and browser. 
  // For <video> tags, often `https://drive.google.com/uc?export=download&id=...` works 
  // if the file is public.
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
