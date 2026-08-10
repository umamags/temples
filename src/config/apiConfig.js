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
  // For both localhost and production, the path is /php_app/upload/
  return '/php_app/upload'
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
