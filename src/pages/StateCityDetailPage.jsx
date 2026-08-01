import { Link, useParams, useNavigate } from 'react-router-dom'
import { statesAndCities } from '../data/statesData'
import { citiesWithTempleData } from '../data/citiesWithTempleData'
import { deslugify, slugify } from '../utils/slug'
import { useTemples } from '../data/useTemples'
import TempleTable from '../components/TempleTable'
import IndiaMap from '../components/IndiaMap'

export default function StateCityDetailPage() {
  const { stateName, cityName } = useParams()
  const navigate = useNavigate()

  const displayStateName = deslugify(stateName)
  const displayCityName = deslugify(cityName)

  // Find state from statesData
  const stateData = statesAndCities.find((s) => s.state === displayStateName)

  // Find city from citiesWithTempleData (the source of truth)
  const cityWithTempleData = citiesWithTempleData.find(
    (c) => c.state === displayStateName && c.city === displayCityName
  )

  // Also check if city is in stateData for backward compatibility
  const cityInState = stateData?.cities.find((c) => c.name === displayCityName)

  const { temples, status: templesStatus } = useTemples(displayStateName, displayCityName)

  if (!stateData || (!cityWithTempleData && !cityInState)) {
    return (
      <div className="page">
        <p className="status status-error">State or city not found.</p>
        <Link to="/">← Back to Home</Link>
      </div>
    )
  }

  // Use city data from whichever source has it
  const city = cityWithTempleData || cityInState

  const handleCityClick = (state, clickedCity) => {
    if (state === displayStateName && clickedCity === displayCityName) {
      return // Already on this page
    }
    navigate(`/state/${slugify(state)}/city/${slugify(clickedCity)}`)
  }

  const handleStateClick = (state) => {
    if (state === displayStateName) {
      return // Already on this state's page
    }
    navigate(`/state/${slugify(state)}`)
  }

  return (
    <div className="page">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/">← Back to Home</Link>
      </div>

      <div className="detail-title-row">
        <div>
          <h1>{displayCityName}</h1>
          <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '0.5rem' }}>
            <strong>{displayStateName}</strong>
          </p>
        </div>
      </div>

      <div className="map-container">
        <IndiaMap onCityClick={handleCityClick} onStateClick={handleStateClick} height={400} />
      </div>

      <section className="detail-section">
        <h2>About {displayCityName}</h2>
        <dl className="facts">
          <div className="fact">
            <dt>City</dt>
            <dd>{displayCityName}</dd>
          </div>
          <div className="fact">
            <dt>State</dt>
            <dd>{displayStateName}</dd>
          </div>
          <div className="fact">
            <dt>State Capital</dt>
            <dd>{stateData.capital}</dd>
          </div>
          <div className="fact">
            <dt>Coordinates</dt>
            <dd>
              {city.lat.toFixed(4)}°N, {city.lon.toFixed(4)}°E
            </dd>
          </div>
        </dl>
      </section>

      <section className="detail-section">
        <h2>Nearby Cities in {displayStateName}</h2>
        <ul className="named-list">
          {stateData.cities.map((c) => (
            <li key={c.name}>
              {c.name === displayCityName ? (
                <span className="named-list-name" style={{ color: '#0066cc', fontWeight: 'bold' }}>
                  {c.name} (Current)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCityClick(displayStateName, c.name)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0066cc',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    fontSize: 'inherit',
                  }}
                  className="named-list-name"
                >
                  {c.name}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        {templesStatus === 'loading' && <p style={{ color: '#666' }}>Loading temples...</p>}
        {templesStatus === 'error' && <p style={{ color: '#e74c3c' }}>Unable to load temples data</p>}
        {templesStatus === 'ready' && temples.length > 0 ? (
          <TempleTable
            temples={temples}
            title={`Temples and Sacred Sites in ${displayCityName}`}
            showStateCity={false}
          />
        ) : templesStatus === 'ready' ? (
          <p style={{ color: '#999' }}>No temples data available for {displayCityName} yet.</p>
        ) : null}
      </section>
    </div>
  )
}
