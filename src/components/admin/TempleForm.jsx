import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../../config/apiConfig'

export default function TempleForm({ templeId, onSuccess, onCancel }) {
  const [states, setStates] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    deity: '',
    location_id: '',
    year_constructed: '',
    location_note: '',
    website: '',
    image_url: '',
    source: 'manual',
    festivals_and_events: ''
  })

  useEffect(() => {
    fetchStates()
    if (templeId) {
      fetchTemple()
    }
  }, [templeId])

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

  const fetchLocationsByState = async (stateId) => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/backend/query/getLocations.php`)
      const data = await response.json()
      if (data.success) {
        const filtered = (data.data || []).filter(l => l.state_id === parseInt(stateId))
        setLocations(filtered)
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    }
  }

  const fetchTemple = async () => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(
        `${baseUrl}/backend/query/getTempleDetail.php?temple_id=${templeId}`
      )
      const data = await response.json()
      if (data.success) {
        const temple = data.data
        fetchLocationsByState(temple.state_id)
        setFormData({
          name: temple.name || '',
          deity: temple.deity || '',
          location_id: temple.location_id || '',
          year_constructed: temple.year_constructed || '',
          location_note: temple.location_note || '',
          website: temple.website || '',
          image_url: temple.image_url || '',
          source: temple.source || 'manual',
          festivals_and_events: Array.isArray(temple.festivals_and_events)
            ? temple.festivals_and_events.join('\n')
            : ''
        })
      }
    } catch (err) {
      console.error('Failed to fetch temple:', err)
      setError('Failed to load temple')
    }
  }

  const handleStateChange = (e) => {
    const stateId = parseInt(e.target.value)
    if (stateId) {
      fetchLocationsByState(stateId)
    } else {
      setLocations([])
    }
    setFormData(prev => ({ ...prev, location_id: '' }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.name || !formData.location_id) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      const baseUrl = getApiBaseUrl()
      const endpoint = templeId ? 'updateTemple' : 'addTemple'

      const festivals = formData.festivals_and_events
        .split('\n')
        .map(f => f.trim())
        .filter(f => f)

      const payload = {
        ...formData,
        festivals_and_events: festivals,
        year_constructed: formData.year_constructed ? parseInt(formData.year_constructed) : null
      }

      if (templeId) {
        payload.temple_id = templeId
      }

      const response = await fetch(`${baseUrl}/backend/edit/${endpoint}.php`, {
        method: templeId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to save temple')
        return
      }

      if (onSuccess) {
        onSuccess(data.data)
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError('Failed to save temple')
    } finally {
      setLoading(false)
    }
  }

  const selectedLocation = locations.find(l => l.id === parseInt(formData.location_id))
  const selectedState = states.find(s =>
    locations.some(l => l.id === parseInt(formData.location_id) && l.state_id === s.id)
  )

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '700px' }}>
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
          Temple Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Meenakshi Temple"
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
          Deity
        </label>
        <input
          type="text"
          name="deity"
          value={formData.deity}
          onChange={handleChange}
          placeholder="e.g., Meenakshi (Parvati)"
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            State *
          </label>
          <select
            value={selectedState?.id || ''}
            onChange={handleStateChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          >
            <option value="">Select state</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Location/City *
          </label>
          <select
            name="location_id"
            value={formData.location_id}
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
            <option value="">Select location</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Year Constructed
        </label>
        <input
          type="number"
          name="year_constructed"
          value={formData.year_constructed}
          onChange={handleChange}
          placeholder="e.g., 1623"
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
          Location Note
        </label>
        <textarea
          name="location_note"
          value={formData.location_note}
          onChange={handleChange}
          placeholder="Additional location details..."
          rows="3"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '1rem',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Website
        </label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://example.com"
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
          Image URL
        </label>
        <input
          type="url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
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
          Festivals & Events (one per line)
        </label>
        <textarea
          name="festivals_and_events"
          value={formData.festivals_and_events}
          onChange={handleChange}
          placeholder="Panguni Peruvizha&#10;Arubathimoovar Festival"
          rows="3"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '1rem',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Source
        </label>
        <select
          name="source"
          value={formData.source}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '1rem'
          }}
        >
          <option value="manual">Manual Entry</option>
          <option value="wikipedia">Wikipedia</option>
          <option value="top_pick">Top Pick</option>
          <option value="detailed">Detailed</option>
        </select>
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
          {loading ? 'Saving...' : templeId ? 'Update Temple' : 'Add Temple'}
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
