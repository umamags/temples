import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import IndiaMap from '../components/IndiaMap'
import TempleTable from '../components/TempleTable'
import CitySearch from '../components/CitySearch'
import { useAllTemples } from '../data/useAllTemples'
import { useVisitedTemples } from '../hooks/useVisitedTemples'
import { getApiBaseUrl } from '../config/apiConfig'

export default function HomePage() {
  const navigate = useNavigate()
  const { allTemples, status: templesStatus } = useAllTemples()
  const { visitCount } = useVisitedTemples()

  const [states, setStates] = useState([])
  const [locations, setLocations] = useState([])
  const [statesLoading, setStatesLoading] = useState(true)

  // Fetch states and locations from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = getApiBaseUrl()

        // Fetch states
        const statesResponse = await fetch(`${baseUrl}/backend/query/getStates.php`)
        const statesData = await statesResponse.json()
        if (statesData.success) {
          setStates(statesData.data || [])
        }

        // Fetch locations
        const locationsResponse = await fetch(`${baseUrl}/backend/query/getLocations.php`)
        const locationsData = await locationsResponse.json()
        if (locationsData.success) {
          setLocations(locationsData.data || [])
        }

        setStatesLoading(false)
      } catch (err) {
        console.error('Failed to fetch states/locations:', err)
        setStatesLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCityClick = (cityId) => {
    navigate(`/city/${cityId}`)
  }

  const handleStateClick = (stateId) => {
    navigate(`/state/${stateId}`)
  }

  // Prepare map data from locations
  const mapLocations = locations.map(loc => ({
    id: loc.id,
    name: loc.name,
    state: loc.state,
    state_id: loc.state_id,
    lat: loc.lat,
    lon: loc.lon,
    kind: loc.kind
  }))

  const mapStates = states.map(state => ({
    id: state.id,
    name: state.name,
    lat: locations
      .filter(l => l.state_id === state.id && l.lat)
      .reduce((sum, l) => sum + l.lat, 0) / (locations.filter(l => l.state_id === state.id && l.lat).length || 1),
    lon: locations
      .filter(l => l.state_id === state.id && l.lon)
      .reduce((sum, l) => sum + l.lon, 0) / (locations.filter(l => l.state_id === state.id && l.lon).length || 1)
  }))

  return (
    <div className="page">
      <h1>Explore Temples Across India</h1>
      {visitCount > 0 && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          color: '#004085',
        }}>
          <strong>✓ You have visited {visitCount} {visitCount === 1 ? 'temple' : 'temples'}</strong>
        </div>
      )}
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1.5rem' }}>
        Click on any state to see all temples, or click on a city dot to explore temples in that city.
      </p>

      <div className="map-container">
        {!statesLoading && mapStates.length > 0 && (
          <IndiaMap
            locations={mapLocations}
            states={mapStates}
            onCityClick={handleCityClick}
            onStateClick={handleStateClick}
            height={500}
          />
        )}
        {statesLoading && <p>Loading map...</p>}
      </div>

      <CitySearch />

      {templesStatus === 'ready' && allTemples.length > 0 && (
        <section className="detail-section">
          <TempleTable temples={allTemples} title="All Temples Across India" showStateCity={true} format="temples2" />
        </section>
      )}

      {!statesLoading && states.length > 0 && (
        <section className="detail-section">
          <h2>States and Cities</h2>
          <div className="state-city-list">
            {states.map((state) => {
              const citiesInState = locations.filter(l => l.state_id === state.id)
              return (
                <div key={state.id} className="state-city-card">
                  <h3>
                    <button
                      type="button"
                      onClick={() => handleStateClick(state.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#333',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        padding: 0,
                        fontSize: 'inherit',
                        fontWeight: 'inherit',
                      }}
                    >
                      {state.name}
                    </button>
                  </h3>
                  <div style={{ marginTop: '0.75rem' }}>
                    <strong>Temples: {state.temple_count || state.total_temples || 0}</strong>
                    {citiesInState.length > 0 ? (
                      <>
                        <p style={{ margin: '0.5rem 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                          {citiesInState.length} cities/towns
                        </p>
                        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                          {citiesInState.slice(0, 5).map((city) => (
                            <li key={city.id}>
                              <button
                                type="button"
                                onClick={() => handleCityClick(city.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#0066cc',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  padding: 0,
                                  fontSize: 'inherit',
                                }}
                              >
                                {city.name}
                              </button>
                              {city.temple_count > 0 && (
                                <span style={{ color: '#999', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                                  ({city.temple_count})
                                </span>
                              )}
                            </li>
                          ))}
                          {citiesInState.length > 5 && (
                            <li style={{ color: '#999', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                              +{citiesInState.length - 5} more
                            </li>
                          )}
                        </ul>
                      </>
                    ) : (
                      <p style={{ color: '#999', margin: 0, marginLeft: '1.5rem', fontSize: '0.9rem' }}>No cities with temples</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
