import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import LocationForm from '../../components/admin/LocationForm'

export default function AdminLocationsEditPage() {
  const { locationId } = useParams()
  const navigate = useNavigate()
  const [successMessage, setSuccessMessage] = useState(null)

  const handleSuccess = (data) => {
    setSuccessMessage('Location updated successfully!')
    setTimeout(() => {
      navigate('/admin/locations')
    }, 1500)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/locations" style={{ color: '#0066cc', textDecoration: 'underline' }}>
          ← Back to Locations
        </Link>
      </div>

      <h1>📍 Edit Location</h1>

      {successMessage && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d4edda',
          border: '1px solid #2e7d32',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          color: '#2e7d32'
        }}>
          {successMessage}
        </div>
      )}

      <LocationForm
        locationId={parseInt(locationId)}
        onSuccess={handleSuccess}
        onCancel={() => navigate('/admin/locations')}
      />
    </div>
  )
}
