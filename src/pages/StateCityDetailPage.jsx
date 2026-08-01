import { Link, useParams, useNavigate } from 'react-router-dom'
import { statesAndCities } from '../data/statesData'
import { deslugify } from '../utils/slug'
import { useTemples } from '../data/useTemples'
import IndiaMap from '../components/IndiaMap'

export default function StateCityDetailPage() {
  const { stateName, cityName } = useParams()
  const navigate = useNavigate()

  const displayStateName = deslugify(stateName)
  const displayCityName = deslugify(cityName)

  const stateData = statesAndCities.find((s) => s.state === displayStateName)
  const city = stateData?.cities.find((c) => c.name === displayCityName)
  const { temples, status: templesStatus } = useTemples(displayStateName, displayCityName)

  if (!stateData || !city) {
    return (
      <div className="page">
        <p className="status status-error">State or city not found.</p>
        <Link to="/">← Back to Home</Link>
      </div>
    )
  }

  const handleCityClick = (state, clickedCity) => {
    if (state === displayStateName && clickedCity === displayCityName) {
      return // Already on this page
    }
    navigate(`/state/${state.replace(/\s+/g, '-').toLowerCase()}/city/${clickedCity.replace(/\s+/g, '-').toLowerCase()}`)
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
        <IndiaMap onCityClick={handleCityClick} height={400} />
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
        <h2>Temples and Sacred Sites</h2>
        {templesStatus === 'loading' && <p style={{ color: '#666' }}>Loading temples...</p>}
        {templesStatus === 'error' && <p style={{ color: '#e74c3c' }}>Unable to load temples data</p>}
        {templesStatus === 'ready' && temples.length > 0 ? (
          <div className="temples-grid">
            {temples.map((temple, idx) => (
              <div key={idx} className="temple-card">
                <h3>{temple.name}</h3>
                {temple.image_url && (
                  <img src={temple.image_url} alt={temple.name} style={{ width: '100%' }} />
                )}
                <p>
                  <strong>Main Deity:</strong> {temple.main_deity}
                </p>
                {temple.year_constructed && (
                  <p>
                    <strong>Year Constructed:</strong> {temple.year_constructed}
                  </p>
                )}
                {temple.website && (
                  <p>
                    <a href={temple.website} target="_blank" rel="noopener noreferrer" className="temple-website">
                      Visit Website →
                    </a>
                  </p>
                )}
                {temple.festivals_and_events && temple.festivals_and_events.length > 0 && (
                  <div>
                    <strong>Festivals & Events:</strong>
                    <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: '#666' }}>
                      {temple.festivals_and_events.map((festival, i) => (
                        <li key={i}>{festival}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : templesStatus === 'ready' ? (
          <p style={{ color: '#999' }}>No temples data available for {displayCityName} yet.</p>
        ) : null}
      </section>
    </div>
  )
}
