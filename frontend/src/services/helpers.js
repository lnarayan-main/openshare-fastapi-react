export const getMediaUrl = (path) => {
  if (!path) return null;
  // If the path is already a full URL (like an external link), return it
  if (path.startsWith('http')) return path;
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  
  // Ensure we don't have double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};