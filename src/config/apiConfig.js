// Get the appropriate API base URL based on the current environment
export function getApiBaseUrl() {
  const hostname = window.location.hostname

  // For localhost, use port 8000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000'
  }

  // For production, use ai-lab.in
  if (hostname.includes('ai-lab.in')) {
    return 'https://ai-lab.in'
  }

  // Default to ai-lab.in
  return 'https://ai-lab.in'
}

// Get the upload path based on the current environment
export function getUploadPath() {
  const hostname = window.location.hostname

  // For localhost, return /backend/upload
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/backend/upload'
  }

  // For production (ai-lab.in), return /temples/backend/upload
  if (hostname.includes('ai-lab.in')) {
    return '/temples/backend/upload'
  }

  // Default to /temples/backend/upload for any other domain
  return '/temples/backend/upload'
}

// Construct the full API URL for file listing
export function getFileListUrl(folderPath) {
  const baseUrl = getApiBaseUrl()
  const uploadPath = getUploadPath()
  return `${baseUrl}${uploadPath}/listfiles.php?folder=${encodeURIComponent(folderPath)}`
}

// Construct the full image URL
export function getImageUrl(folderPath, imagePath) {
  const baseUrl = getApiBaseUrl()
  const hostname = window.location.hostname

  // For localhost, images are at /upload/
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${baseUrl}/upload/${folderPath}${imagePath}`
  }

  // For production, images are at /data/
  return `${baseUrl}/data/${folderPath}${imagePath}`
}

// Construct the upload endpoint URL
export function getUploadUrl() {
  const baseUrl = getApiBaseUrl()
  const uploadPath = getUploadPath()
  return `${baseUrl}${uploadPath}/upload.php`
}
