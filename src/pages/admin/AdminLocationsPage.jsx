import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiBaseUrl } from '../../config/apiConfig'

export default function AdminLocationsPage() {
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteMessage, setDeleteMessage] = useState(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/backend/query/getLocations.php`)
      const data = await response.json()
      if (data.success) {
        setLocations(data.data || [])
      } else {
        setError('Failed to load locations')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (locationId) => {
    if (!window.confirm('Delete this location? All temples in this location will be deleted (cascade delete).')) {
      return
    }

    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/backend/edit/deleteLocation.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_id: locationId })
      })

      const data = await response.json()

      if (data.success) {
        setDeleteMessage(`Location deleted! (${data.data.deleted_temples_count} temples cascaded)`)
        setTimeout(() => {
          setDeleteMessage(null)
          fetchLocations()
        }, 2000)
      } else {
        setError(data.error || 'Failed to delete location')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete location')
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin" style={{ color: '#0066cc', textDecoration: 'underline' }}>
          ← Back to Admin
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>📍 Manage Locations</h1>
        <Link
          to="/admin/locations/add"
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#2e7d32',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          + Add Location
        </Link>
      </div>

      {deleteMessage && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d4edda',
          border: '1px solid #2e7d32',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          color: '#2e7d32'
        }}>
          ✓ {deleteMessage}
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
        <p>Loading locations...</p>
      ) : locations.length === 0 ? (
        <p style={{ color: '#666' }}>No locations found. <Link to="/admin/locations/add">Add one now</Link>.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#2c5aa0', color: 'white' }}>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Location</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>State</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Type</th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '1rem' }}>
                    <strong>{location.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{location.state}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      color: '#1565c0'
                    }}>
                      {location.kind}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/admin/locations/${location.id}/edit`)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#2c5aa0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '0.5rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(location.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#c62828',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
