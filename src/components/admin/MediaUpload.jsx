import { useState } from 'react'
import { getApiBaseUrl } from '../../config/apiConfig'

export default function MediaUpload({ templeId, mediaType, onUploadSuccess, existingMedia = [] }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)

  const isPhoto = mediaType === 'photo'
  const isVideo = mediaType === 'video'
  const isDescription = mediaType === 'description'

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)

    // Show preview for images
    if (isPhoto) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (isDescription) {
      handleDescriptionUpload()
      return
    }

    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const baseUrl = getApiBaseUrl()
      const formData = new FormData()
      formData.append('temple_id', templeId)
      formData.append('media_type', mediaType)
      formData.append('file', file)

      const response = await fetch(`${baseUrl}/backend/edit/uploadTempleMedia.php`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Upload failed')
        return
      }

      setFile(null)
      setPreview(null)
      e.target.reset()

      if (onUploadSuccess) {
        onUploadSuccess(data.data)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDescriptionUpload = async () => {
    const textarea = document.getElementById('description-text')
    const description = textarea.value.trim()

    if (!description) {
      setError('Please enter a description')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const baseUrl = getApiBaseUrl()
      const formData = new FormData()
      formData.append('temple_id', templeId)
      formData.append('media_type', 'description')
      formData.append('description', description)

      const response = await fetch(`${baseUrl}/backend/edit/uploadTempleMedia.php`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Upload failed')
        return
      }

      textarea.value = ''

      if (onUploadSuccess) {
        onUploadSuccess(data.data)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      border: '1px solid #ddd',
      marginBottom: '1.5rem'
    }}>
      <h4 style={{ marginTop: 0 }}>
        {isPhoto && '📷 Upload Photo'}
        {isVideo && '🎥 Upload Video'}
        {isDescription && '📝 Add Description'}
      </h4>

      {error && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#ffebee',
          border: '1px solid #c62828',
          borderRadius: '4px',
          marginBottom: '1rem',
          color: '#c62828',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleUpload}>
        {isDescription ? (
          <textarea
            id="description-text"
            placeholder="Enter temple description..."
            rows="6"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '0.9rem',
              marginBottom: '1rem',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
          />
        ) : (
          <>
            <input
              type="file"
              onChange={handleFileChange}
              accept={isPhoto ? 'image/*' : 'video/*'}
              style={{
                display: 'block',
                marginBottom: '1rem',
                width: '100%'
              }}
            />

            {preview && (
              <div style={{ marginBottom: '1rem' }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={uploading || (!isDescription && !file)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading || (!isDescription && !file) ? 0.6 : 1
          }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {/* Show existing media */}
      {existingMedia && existingMedia.length > 0 && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #ddd' }}>
          <h5 style={{ marginTop: 0 }}>Existing Files ({existingMedia.length})</h5>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            {existingMedia.map((url, idx) => (
              <div key={idx} style={{
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #ddd',
                wordBreak: 'break-all',
                fontSize: '0.8rem'
              }}>
                {isPhoto && (
                  <img
                    src={url}
                    alt={`media-${idx}`}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '3px',
                      marginBottom: '0.5rem'
                    }}
                  />
                )}
                <div style={{ color: '#666', fontSize: '0.75rem' }}>
                  {url.split('/').pop()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
