import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTemples } from '../data/useTemples'
import TempleTable from '../components/TempleTable'
import IndiaMap from '../components/IndiaMap'

export default function StateCityDetailPage() {
  const { cityId } = useParams()
  const navigate = useNavigate()

  if (!cityId) {
    return (
      <div className="page">
        <p className="status status-error">No city ID provided</p>
        <Link to="/">← Back to Home</Link>
      </div>
    )
  }

  const { temples, status: templesStatus, error, city } = useTemples(parseInt(cityId))

  if (templesStatus === 'error') {
    return (
      <div className="page">
        <p className="status status-error">{error || 'Failed to load city details'}</p>
        <Link to="/">← Back to Home</Link>
      </div>
    )
  }

  const cityName = city?.name || 'Loading...'
  const stateName = city?.state || 'Loading...'
  const stateId = city?.state_id

  const handleStateClick = (clickedStateId) => {
    navigate(`/state/${clickedStateId}`)
  }

  const handleCityClick = (clickedCityId) => {
    if (clickedCityId === cityId) {
      return // Already on this page
    }
    navigate(`/city/${clickedCityId}`)
  }

  return (
    <div className="page">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/">← Back to Home</Link>
      </div>

      <div className="detail-title-row">
        <div>
          <h1>{cityName}</h1>
          <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '0.5rem' }}>
            <strong>{stateName}</strong>
          </p>
        </div>
      </div>

      <div className="map-container">
        <IndiaMap
          onCityClick={handleCityClick}
          onStateClick={handleStateClick}
          height={400}
        />
      </div>

      <section className="detail-section">
        <h2>About {cityName}</h2>
        <dl className="facts">
          <div className="fact">
            <dt>City</dt>
            <dd>{cityName}</dd>
          </div>
          <div className="fact">
            <dt>State</dt>
            <dd>{stateName}</dd>
          </div>
          {city?.lat && city?.lon && (
            <div className="fact">
              <dt>Coordinates</dt>
              <dd>
                {city.lat.toFixed(4)}°N, {city.lon.toFixed(4)}°E
              </dd>
            </div>
          )}
        </dl>
      </section>

      {templesStatus === 'loading' && (
        <section className="detail-section">
          <p>Loading temples...</p>
        </section>
      )}

      {temples.length > 0 && (
        <section className="detail-section">
          <TempleTable
            temples={temples}
            title={`Temples in ${cityName}`}
            showStateCity={false}
            format="temples2"
          />
        </section>
      )}

      {templesStatus === 'ready' && temples.length === 0 && (
        <section className="detail-section">
          <p>No temples found in {cityName}</p>
        </section>
      )}
    </div>
  )
}
