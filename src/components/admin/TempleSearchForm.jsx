import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../../config/apiConfig'

export default function TempleSearchForm({ onSearch }) {
  const [states, setStates] = useState([])
  const [locations, setLocations] = useState([])
  const [filters, setFilters] = useState({
    state_id: '',
    location_id: '',
    name: ''
  })

  useEffect(() => {
    fetchStates()
  }, [])

  useEffect(() => {
    if (filters.state_id) {
      fetchLocationsByState(filters.state_id)
    } else {
      setLocations([])
      setFilters(prev => ({ ...prev, location_id: '' }))
    }
  }, [filters.state_id])

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(filters)
    }
  }

  const handleReset = () => {
    setFilters({ state_id: '', location_id: '', name: '' })
    if (onSearch) {
      onSearch({ state_id: '', location_id: '', name: '' })
    }
  }

  return (
    <form onSubmit={handleSearch} style={{
      padding: '1.5rem',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      marginBottom: '2rem'
    }}>
      <h3 style={{ marginTop: 0 }}>Search Temples</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {/* State Filter */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
            State
          </label>
          <select
            name="state_id"
            value={filters.state_id}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '0.9rem'
            }}
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Location/City
          </label>
          <select
            name="location_id"
            value={filters.location_id}
            onChange={handleChange}
            disabled={!filters.state_id}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '0.9rem',
              opacity: !filters.state_id ? 0.6 : 1
            }}
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name Search */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Temple Name
          </label>
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleChange}
            placeholder="Search temple name..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '0.9rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2c5aa0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          🔍 Search
        </button>
        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#999',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
    </form>
  )
}
