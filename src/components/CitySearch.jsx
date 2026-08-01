import { useState, useMemo } from 'react'
import { citiesWithTempleData } from '../data/citiesWithTempleData'
import TempleTable from './TempleTable'
import { useTemples } from '../data/useTemples'

export default function CitySearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState(null)
  const { temples, status: templesStatus } = useTemples(selectedCity?.state, selectedCity?.city)

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return []

    const term = searchTerm.toLowerCase()
    return citiesWithTempleData.filter((city) => {
      return (
        city.city.toLowerCase().includes(term) || city.state.toLowerCase().includes(term)
      )
    })
  }, [searchTerm])

  const handleCitySelect = (city) => {
    setSelectedCity(city)
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
                key={`${city.state}-${city.city}`}
                onClick={() => handleCitySelect(city)}
                className="city-suggestion-item"
              >
                <strong>{city.city}</strong>
                <span>{city.state}</span>
              </button>
            ))}
          </div>
        )}

        {searchTerm.trim() && filteredCities.length === 0 && (
          <div className="city-suggestions empty">
            <p>No cities found matching "{searchTerm}"</p>
            <p className="hint">Available cities: {citiesWithTempleData.map((c) => c.city).join(', ')}</p>
          </div>
        )}
      </div>

      {selectedCity && (
        <>
          <div className="selected-city-info">
            <h3>
              {selectedCity.city}, {selectedCity.state}
            </h3>
            <button
              onClick={() => {
                setSelectedCity(null)
                setSearchTerm('')
              }}
              className="clear-selection-btn"
            >
              Clear Selection
            </button>
          </div>

          {templesStatus === 'loading' && <p style={{ color: '#666' }}>Loading temples...</p>}
          {templesStatus === 'error' && <p style={{ color: '#e74c3c' }}>Unable to load temples data</p>}
          {templesStatus === 'ready' && temples.length > 0 ? (
            <TempleTable temples={temples} title={`Temples in ${selectedCity.city}`} showStateCity={false} />
          ) : templesStatus === 'ready' ? (
            <p style={{ color: '#999' }}>No temples data available for {selectedCity.city} yet.</p>
          ) : null}
        </>
      )}
    </section>
  )
}
