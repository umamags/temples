import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../config/apiConfig'

export default function TempleGallery({ templeId, templeName }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchImages()
  }, [templeId])

  const fetchImages = async () => {
    try {
      setLoading(true)
      setError(null)
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/backend/multimedia/getMultimedia.php?temple_id=${templeId}`)
      const data = await response.json()

      if (data.success) {
        setImages(data.images || [])
      } else {
        setError(data.error || 'Failed to load images')
      }
    } catch (err) {
      console.error('Error fetching images:', err)
      setError('Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#1a1a1a' }}>
          Photo Gallery
        </h2>
        <p style={{ color: '#666' }}>Loading photos...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#1a1a1a' }}>
          Photo Gallery
        </h2>
        <p style={{ color: '#d32f2f' }}>{error}</p>
      </section>
    )
  }

  if (!images || images.length === 0) {
    return null
  }

  return (
    <>
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#1a1a1a' }}>
          Photo Gallery ({images.length})
        </h2>

        {/* Image Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}
        >
          {images.map((image, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(image)}
              style={{
                cursor: 'pointer',
                overflow: 'hidden',
                borderRadius: '8px',
                backgroundColor: '#f0f0f0',
                transition: 'transform 0.2s, box-shadow 0.2s',
                aspectRatio: '1',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <img
                src={image.path}
                alt={image.filename}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
        </div>
      </section>

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
            padding: '2rem'
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid white',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            ✕
          </button>

          {/* Image container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <img
              src={selectedImage.path}
              alt={selectedImage.filename}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            <p style={{
              color: 'white',
              marginTop: '1rem',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {selectedImage.filename}
            </p>
          </div>

          {/* Navigation hints */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}
          >
            Click to close
          </div>
        </div>
      )}
    </>
  )
}
