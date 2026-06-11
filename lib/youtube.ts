/**
 * Extracts the YouTube video ID from various URL formats:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *   https://www.youtube.com/watch?v=VIDEO_ID&list=...
 * Returns the ID string or null if unrecognized.
 */
export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&?#]+)/,
    /(?:youtu\.be\/)([^&?#]+)/,
    /(?:youtube\.com\/embed\/)([^&?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&?#]+)/,
  ];

  for (const re of patterns) {
    const match = url.match(re);
    if (match?.[1]) return match[1];
  }

  return null;
}

/** High-quality thumbnail from a YouTube video ID */
export function youtubeThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

/** Embed URL from a YouTube video ID (with privacy-enhanced domain) */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
