import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTempleDetail } from '../data/useTempleDetail'

export default function TempleDetailPage() {
  const { stateName, cityName, templeName } = useParams()
  const navigate = useNavigate()
  const { temple, googleResults, status, error } = useTempleDetail(stateName, cityName, templeName)

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

  const formatCityForAPI = (city) => {
    return city.toLowerCase().replace(/\s+/g, '_')
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
      formData.append('state', formatStateForAPI(temple.state))
      formData.append('city', formatCityForAPI(temple.city))
      formData.append('temple', formatTempleNameForAPI(temple.name))
      if (description.trim()) {
        formData.append('description', description)
      }

      console.log('Uploading to: https://ai-lab.in/php_app/photos/upload.php')
      console.log('Form data:', {
        photo: imageFile.name,
        dataFolder: '../data',
        state: formatStateForAPI(temple.state),
        city: formatCityForAPI(temple.city),
        temple: formatTempleNameForAPI(temple.name),
        description: description || '(empty)',
      })

      const response = await fetch('https://ai-lab.in/php_app/photos/upload.php', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Upload response:', result)
      setUploadMessage('Image uploaded successfully!')
      setImageFile(null)
      setImagePreview(null)
      setDescription('')
    } catch (err) {
      console.error('Upload error:', err)
      let errorMsg = err.message || 'Failed to upload image'

      if (errorMsg.includes('Failed to fetch')) {
        errorMsg = 'CORS Error: The server at ai-lab.in may not allow requests from this domain. Please check with your server administrator.'
      }

      setUploadError(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="page">
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '0.5rem 1rem',
            marginBottom: '1rem',
            cursor: 'pointer',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          ← Back
        </button>
        <p>Loading temple details...</p>
      </div>
    )
  }

  if (error || status === 'error') {
    return (
      <div className="page">
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '0.5rem 1rem',
            marginBottom: '1rem',
            cursor: 'pointer',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          ← Back
        </button>
        <h1>Temple Not Found</h1>
        <p style={{ color: '#d32f2f', marginTop: '1rem' }}>
          {error || 'Could not load temple details. Please try again.'}
        </p>
      </div>
    )
  }

  if (!temple) {
    return (
      <div className="page">
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '0.5rem 1rem',
            marginBottom: '1rem',
            cursor: 'pointer',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          ← Back
        </button>
        <p>No temple data available.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: '0.5rem 1rem',
          marginBottom: '1rem',
          cursor: 'pointer',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      >
        ← Back
      </button>

      <div className="temple-detail-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Temple Header */}
        <div style={{ borderBottom: '2px solid #e0e0e0', paddingBottom: '2rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>{temple.name}</h1>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Location
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>
                {temple.city}, <strong>{temple.state}</strong>
              </p>
            </div>

            {temple.main_deity && (
              <div>
                <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Main Deity
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>{temple.main_deity}</p>
              </div>
            )}

            {temple.year_constructed && (
              <div>
                <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Year Constructed
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>{temple.year_constructed}</p>
              </div>
            )}
          </div>

          {temple.website && !temple.website.includes('example.com') && (
            <a
              href={temple.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0066cc',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '500',
              }}
            >
              Visit Website
            </a>
          )}
        </div>

        {/* Temple Details */}
        {(temple.festivals_and_events || temple.wiki_url) && (
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
            {temple.festivals_and_events && temple.festivals_and_events.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Festivals & Events</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {temple.festivals_and_events.map((festival) => (
                    <span
                      key={festival}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '20px',
                        fontSize: '0.95rem',
                        color: '#333',
                      }}
                    >
                      {festival}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {temple.wiki_url && (
              <div>
                <a
                  href={temple.wiki_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    color: '#0066cc',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                  }}
                >
                  → Read Wikipedia article
                </a>
              </div>
            )}
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

      </div>
    </div>
  )
}
