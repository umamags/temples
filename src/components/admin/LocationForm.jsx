import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../../config/apiConfig'

export default function LocationForm({ locationId, onSuccess, onCancel }) {
  const [states, setStates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    state_id: '',
    name: '',
    slug: '',
    kind: 'city',
    lat: '',
    lon: ''
  })

  useEffect(() => {
    fetchStates()
    if (locationId) {
      fetchLocation()
    }
  }, [locationId])

  const fetchStates = async () => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/backend/query/getStates.php`)
      const data = await response.json()
      if (data.success) {
        setStates(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch states:', err)
    }
  }

  const fetchLocation = async () => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/backend/query/getLocations.php`)
      const data = await response.json()
      if (data.success) {
        const location = data.data.find(l => l.id === parseInt(locationId))
        if (location) {
          setFormData({
            state_id: location.state_id,
            name: location.name,
            slug: location.slug,
            kind: location.kind,
            lat: location.lat,
            lon: location.lon
          })
        }
      }
    } catch (err) {
      console.error('Failed to fetch location:', err)
      setError('Failed to load location')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    setFormData(prev => ({ ...prev, slug }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const baseUrl = getApiBaseUrl()
      const endpoint = locationId ? 'updateLocation' : 'addLocation'
      const payload = locationId
        ? { location_id: locationId, ...formData }
        : formData

      const response = await fetch(`${baseUrl}/backend/edit/${endpoint}.php`, {
        method: locationId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to save location')
        return
      }

      if (onSuccess) {
        onSuccess(data.data)
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError('Failed to save location')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#ffebee',
          border: '1px solid #c62828',
          borderRadius: '4px',
          marginBottom: '1rem',
          color: '#c62828'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          State *
        </label>
        <select
          name="state_id"
          value={formData.state_id}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '1rem'
          }}
        >
          <option value="">Select a state</option>
          {states.map(state => (
            <option key={state.id} value={state.id}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Location Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Chennai, Bangalore"
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Slug
          <button
            type="button"
            onClick={generateSlug}
            style={{
              marginLeft: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              backgroundColor: '#2c5aa0',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Generate
          </button>
        </label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="e.g., chennai"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Kind/Type *
        </label>
        <select
          name="kind"
          value={formData.kind}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '1rem'
          }}
        >
          <option value="city">City</option>
          <option value="town">Town</option>
          <option value="temple town">Temple Town</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Latitude *
          </label>
          <input
            type="number"
            name="lat"
            value={formData.lat}
            onChange={handleChange}
            step="0.0001"
            placeholder="13.0827"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Longitude *
          </label>
          <input
            type="number"
            name="lon"
            value={formData.lon}
            onChange={handleChange}
            step="0.0001"
            placeholder="80.2707"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Saving...' : locationId ? 'Update Location' : 'Add Location'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#999',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
