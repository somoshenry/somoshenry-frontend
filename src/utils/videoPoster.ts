// Utilities to derive a poster (first frame) for a given video URL

// Detect Cloudinary hosted video
export function isCloudinaryVideo(url: string): boolean {
  return /res\.cloudinary\.com\//.test(url) && /\/video\/upload\//.test(url);
}

// Build a Cloudinary thumbnail URL for the first frame (so_0) as JPG
export function getCloudinaryPoster(url: string): string | null {
  try {
    if (!isCloudinaryVideo(url)) return null;
    // Insert transformation segment `so_0` right after /upload/
    const parts = url.split('/upload/');
    if (parts.length !== 2) return null;
    const [prefix, rest] = parts;

    // Keep any existing transformations by prefixing with so_0 if none present
    // If rest already starts with a transformation (e.g., c_fill,w_500/...), we prepend so_0
    const hasTransform = rest.includes('/v');
    const restParts = rest.split('/');
    // Ensure we inject so_0 before the version/publicId segment
    let injected: string;
    if (hasTransform) {
      // If there are transformations, they are before the version (v12345)
      // Ensure so_0 is present at the beginning.
      injected = `so_0/${rest}`;
    } else {
      // No transformations, rest likely starts with v12345/...
      injected = `so_0/${rest}`;
    }

    // Change extension to .jpg for thumbnail
    injected = injected.replace(/\.(mp4|webm|mov|avi|wmv|mkv|m4v)(\?.*)?$/i, '.jpg$2');

    return `${parts[0]}/upload/${injected}`;
  } catch {
    return null;
  }
}

export function getPosterForVideo(url: string): string | undefined {
  const cloud = getCloudinaryPoster(url);
  if (cloud) return cloud;
  // If not Cloudinary, return undefined to allow runtime capture fallback.
  return undefined;
}
