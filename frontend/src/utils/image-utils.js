export function convertUnsplashUrl(url, options = {}) {
  if (!url) return '/images/placeholders/placeholder.jpg';
  
  if (url.startsWith('uploads/')) {
    return `/uploads/${url.split('uploads/')[1]}`;
  }
  
  const defaultOptions = {
    width: 1200,
    fit: 'crop',
    auto: 'format',
    quality: 80,
    ...options
  };
  
  if (url.includes('images.unsplash.com')) {
    return url;
  }
  
  if (!url.includes('unsplash.com/photos/')) {
    return url;
  }
    try {
    const photoIdMatch = url.match(/photos\/([^/?]+)(?:\?.*)?$/);
    if (!photoIdMatch) return url;
    
    const photoId = photoIdMatch[1];
    const finalPhotoId = photoId.includes('-') ? photoId.split('-').pop() : photoId;
    const cleanPhotoId = decodeURIComponent(finalPhotoId.split('?')[0]);
    
    if (!cleanPhotoId.match(/^[a-zA-Z0-9-_]+$/)) {
      console.warn('Invalid Unsplash photo ID format:', cleanPhotoId);
      return url;
    }
    
    const params = new URLSearchParams();
    Object.entries(defaultOptions).forEach(([key, value]) => {
      params.append(key, value.toString());
    });
    
    return `https://images.unsplash.com/photo-${cleanPhotoId}?${params.toString()}`;
  } catch (error) {
    console.error('Error converting Unsplash URL:', error);
    return url;
  }
}
