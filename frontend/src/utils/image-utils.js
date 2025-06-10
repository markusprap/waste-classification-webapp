/**
 * Converts Unsplash web URLs to image CDN URLs
 * From: https://unsplash.com/photos/a-building-with-balconies-mEdzRk51BiU
 * To: https://images.unsplash.com/photo-[id]?auto=format&fit=crop&w=1200
 */
export function convertUnsplashUrl(url, options = {}) {
  // Skip if URL is undefined or empty
  if (!url) return '/images/placeholder.jpg';
  
  // Handle local backend uploaded images 
  if (url.startsWith('uploads/')) {
    return `/uploads/${url.split('uploads/')[1]}`;
  }
  
  // Default options
  const defaultOptions = {
    width: 1200,
    fit: 'crop',
    auto: 'format',
    quality: 80,
    ...options
  };
  
  // Return as-is if it's already an images.unsplash.com URL
  if (url.includes('images.unsplash.com')) {
    return url;
  }
  
  // Return as-is if it's not an Unsplash URL
  if (!url.includes('unsplash.com/photos/')) {
    return url;
  }
    try {
    // Extract the photo ID using regex to handle various URL formats
    const photoIdMatch = url.match(/photos\/([^/?]+)(?:\?.*)?$/);
    if (!photoIdMatch) return url;
    
    const photoId = photoIdMatch[1];
    // If the last part contains a description with hyphens, get the last part
    const finalPhotoId = photoId.includes('-') ? photoId.split('-').pop() : photoId;
      // Clean up the photo ID (remove any query parameters and decode URL)
    const cleanPhotoId = decodeURIComponent(finalPhotoId.split('?')[0]);
    
    // Validate photo ID format (should be alphanumeric with possible hyphens)
    if (!cleanPhotoId.match(/^[a-zA-Z0-9-_]+$/)) {
      console.warn('Invalid Unsplash photo ID format:', cleanPhotoId);
      return url;
    }
    
    // Build query parameters
    const params = new URLSearchParams();
    Object.entries(defaultOptions).forEach(([key, value]) => {
      params.append(key, value.toString());
    });
    
    // Construct the CDN URL
    return `https://images.unsplash.com/photo-${cleanPhotoId}?${params.toString()}`;
  } catch (error) {
    console.error('Error converting Unsplash URL:', error);
    return url; // Return original URL if conversion fails
  }
}