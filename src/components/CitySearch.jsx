import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TempleTable from './TempleTable'
import { useTemples } from '../data/useTemples'
import { getApiBaseUrl } from '../config/apiConfig'

export default function CitySearch() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [locations, setLocations] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const { temples, status: templesStatus } = useTemples(selectedCity?.id)

  // Fetch all locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const baseUrl = getApiBaseUrl()
        const response = await fetch(`${baseUrl}/backend/query/getLocations.php`)
        const data = await response.json()
        if (data.success) {
          setLocations(data.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch locations:', err)
      }
    }

    fetchLocations()
  }, [])

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return []

    const term = searchTerm.toLowerCase()
    return locations.filter((location) => {
      return (
        location.name.toLowerCase().includes(term) ||
        location.state.toLowerCase().includes(term)
      )
    })
  }, [searchTerm, locations])

  const handleCitySelect = (city) => {
    setSelectedCity(city)
    setSearchTerm('')
  }

  const handleNavigateToCity = (city) => {
    navigate(`/city/${city.id}`)
    setSelectedCity(null)
    setSearchTerm('')
  }

  return (
    <section className="detail-section">
      <h2>Search Cities by Name</h2>

      <div className="city-search-wrapper">
        <input
          type="text"
          placeholder="Search for a city (e.g., Jaipur, Mumbai, Delhi)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        {searchTerm.trim() && filteredCities.length > 0 && (
          <div className="city-suggestions">
            {filteredCities.map((city) => (
              <button
                key={city.id}
                onClick={() => handleCitySelect(city)}
                className="city-suggestion-item"
              >
                <strong>{city.name}</strong>
                <span>{city.state}</span>
              </button>
            ))}
          </div>
        )}

        {searchTerm.trim() && filteredCities.length === 0 && (
          <div className="city-suggestions empty">
            <p>No cities found matching "{searchTerm}"</p>
            <p className="hint">Search available cities with temples</p>
          </div>
        )}
      </div>

      {selectedCity && (
        <>
          <div className="selected-city-info">
            <h3>
              {selectedCity.name}, {selectedCity.state}
            </h3>
            <button
              onClick={() => handleNavigateToCity(selectedCity)}
              className="navigate-btn"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              View City Details
            </button>
            <button
              onClick={() => {
                setSelectedCity(null)
                setSearchTerm('')
              }}
              className="clear-selection-btn"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Clear Selection
            </button>
          </div>

          {templesStatus === 'loading' && (
            <div style={{ marginTop: '1.5rem' }}>
              <p>Loading temples...</p>
            </div>
          )}

          {templesStatus === 'ready' && temples.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <TempleTable
                temples={temples}
                title={`Temples in ${selectedCity.name}`}
                showStateCity={false}
                format="temples2"
              />
            </div>
          )}

          {templesStatus === 'ready' && temples.length === 0 && (
            <div style={{ marginTop: '1.5rem', color: '#666' }}>
              <p>No temples found in {selectedCity.name}</p>
            </div>
          )}
        </>
      )}
    </section>
  )
}
