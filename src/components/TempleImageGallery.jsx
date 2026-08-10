import { useState } from 'react'
import { useTempleImages } from '../data/useTempleImages'
import { getUploadUrl } from '../config/apiConfig'

export default function TempleImageGallery({ stateName, townName, templeName }) {
  const { images, status, error, debugInfo } = useTempleImages(stateName, townName, templeName)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result)
      }
      reader.readAsDataURL(file)
      setUploadMessage(null)
      setUploadError(null)
    }
  }

  const formatTempleNameForAPI = (name) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('_')
  }

  const formatStateForAPI = (state) => {
    return state.toLowerCase().replace(/\s+/g, '_')
  }

  const formatTownForAPI = (town) => {
    return town.toLowerCase().replace(/\s+/g, '_')
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!imageFile) {
      setUploadError('Please select an image')
      return
    }

    setUploading(true)
    setUploadMessage(null)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('photo', imageFile)
      formData.append('dataFolder', '../data')
      formData.append('state', formatStateForAPI(stateName))
      formData.append('city', formatTownForAPI(townName))
      formData.append('temple', formatTempleNameForAPI(templeName))
      if (description.trim()) {
        formData.append('description', description)
      }

      const uploadUrl = getUploadUrl()
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`)
      }

      const result = await response.json()
      setUploadMessage('Image uploaded successfully!')
      setImageFile(null)
      setImagePreview(null)
      setDescription('')
    } catch (err) {
      console.error('Upload error:', err)
      let errorMsg = err.message || 'Failed to upload image'
      if (errorMsg.includes('Failed to fetch')) {
        errorMsg =
          'CORS Error: The server may not allow requests from this domain.'
      }
      setUploadError(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  if (status === 'loading') {
    return <p>Loading images...</p>
  }

  return (
    <div>
      {/* Debug Info */}
      {debugInfo && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            color: '#333',
            borderRadius: '4px',
            marginBottom: '2rem',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            border: '1px solid #ddd',
            overflowX: 'auto',
          }}
        >
          <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Debug Info:</div>
          <div>State: {debugInfo.stateName}</div>
          <div>Town: {debugInfo.townName}</div>
          <div>Temple: {debugInfo.templeName}</div>
          <div style={{ marginTop: '0.5rem' }}>Folder Path: {debugInfo.folderPath}</div>
          <div style={{ marginTop: '0.5rem', wordBreak: 'break-all' }}>
            API URL: {debugInfo.fileListUrl}
          </div>
        </div>
      )}

      {/* Images Gallery */}
      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fff3cd',
            color: '#856404',
            borderRadius: '4px',
            marginBottom: '2rem',
          }}
        >
          Unable to load images: {error}
        </div>
      )}

      {images.length > 0 && (
        <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Gallery</h2>

          {images.map((image, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '2rem',
                alignItems: 'flex-start',
              }}
            >
              {/* Image */}
              <div style={{ flex: '0 0 300px' }}>
                <img
                  src={image.fullUrl}
                  alt={image.name}
                  onClick={() => setSelectedImage(image)}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '1px solid #e0e0e0',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.target.style.transform = 'scale(1.02)')}
                  onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
                />
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#999',
                    marginTop: '0.5rem',
                  }}
                >
                  {image.name}
                </p>
              </div>

              {/* Description */}
              {image.description && (
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      color: '#555',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {image.description}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Upload Section */}
      <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Share Your Photos</h2>

        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Image Upload Input */}
          <div>
            <label
              htmlFor="image-upload"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0066cc',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {imageFile ? '✓ Image Selected' : 'Choose Image'}
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            {imageFile && (
              <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.9rem' }}>
                {imageFile.name}
              </span>
            )}
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: '300px',
                  maxHeight: '300px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                }}
              />
            </div>
          )}

          {/* Description Textarea */}
          <div>
            <label
              htmlFor="description"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: '500',
                color: '#333',
              }}
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this photo..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.75rem',
                fontSize: '0.95rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Messages */}
          {uploadMessage && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '4px',
                border: '1px solid #c3e6cb',
              }}
            >
              ✓ {uploadMessage}
            </div>
          )}

          {uploadError && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '4px',
                border: '1px solid #f5c6cb',
              }}
            >
              ✗ {uploadError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!imageFile || uploading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: imageFile && !uploading ? '#0066cc' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: imageFile && !uploading ? 'pointer' : 'not-allowed',
              opacity: imageFile && !uploading ? 1 : 0.6,
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </form>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'zoom-out',
          }}
        >
          <img
            src={selectedImage.fullUrl}
            alt={selectedImage.name}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
            }}
          />
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
