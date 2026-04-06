export const getMediaUrl = (path) => {
  if (!path) return null;
  // If the path is already a full URL (like an external link), return it
  if (path.startsWith('http')) return path;
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  
  // Ensure we don't have double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// export const getMediaUrl = (path) => {
//   if (!path) return null;

//   // 1. Handle full external URLs (like Cloudinary or S3 links)
//   if (path.startsWith('http://') || path.startsWith('https://')) {
//     return path;
//   }

//   // 2. Get Base URL and remove any trailing slash
//   const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
//   const baseUrl = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;

//   // 3. Ensure the path starts with exactly one slash
//   const cleanPath = path.startsWith('/') ? path : `/${path}`;

//   // 4. Combine: Result is "http://localhost:8000/static/uploads/..."
//   return `${baseUrl}${cleanPath}`;
// };