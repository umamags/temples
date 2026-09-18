import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getApiBaseUrl } from '../../config/apiConfig'
import TempleForm from '../../components/admin/TempleForm'
import MediaUpload from '../../components/admin/MediaUpload'

export default function AdminTemplesEditPage() {
  const { templeId } = useParams()
  const navigate = useNavigate()
  const [temple, setTemple] = useState(null)
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTemple()
  }, [templeId])

  const fetchTemple = async () => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(
        `${baseUrl}/backend/query/getTempleDetail.php?temple_id=${templeId}`
      )
      const data = await response.json()
      if (data.success) {
        setTemple(data.data)
      } else {
        setError('Temple not found')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to load temple')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (data) => {
    setSuccessMessage('Temple updated successfully!')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleMediaUpload = (data) => {
    setSuccessMessage(`${data.media_type} uploaded successfully!`)
    setTimeout(() => {
      setSuccessMessage(null)
      fetchTemple()
    }, 2000)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/temples" style={{ color: '#0066cc', textDecoration: 'underline' }}>
          ← Back to Temples
        </Link>
      </div>

      <h1>🏛️ Edit Temple</h1>

      {successMessage && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d4edda',
          border: '1px solid #2e7d32',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          color: '#2e7d32'
        }}>
          ✓ {successMessage}
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#ffebee',
          border: '1px solid #c62828',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          color: '#c62828'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading temple...</p>
      ) : temple ? (
        <>
          <h2 style={{ marginTop: 0 }}>Temple Information</h2>
          <TempleForm
            templeId={parseInt(templeId)}
            onSuccess={handleSuccess}
            onCancel={() => navigate('/admin/temples')}
          />

          <div style={{ marginTop: '3rem', borderTop: '2px solid #eee', paddingTop: '2rem' }}>
            <h2>Media & Description</h2>
            <p style={{ color: '#666' }}>Add photos, videos, and description for this temple</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              <MediaUpload
                templeId={parseInt(templeId)}
                mediaType="photo"
                onUploadSuccess={handleMediaUpload}
                existingMedia={temple.photo_urls || []}
              />

              <MediaUpload
                templeId={parseInt(templeId)}
                mediaType="video"
                onUploadSuccess={handleMediaUpload}
                existingMedia={temple.video_urls || []}
              />
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <MediaUpload
                templeId={parseInt(templeId)}
                mediaType="description"
                onUploadSuccess={handleMediaUpload}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
