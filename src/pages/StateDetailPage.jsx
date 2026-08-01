import { Link, useParams } from 'react-router-dom'
import { statesAndCities } from '../data/statesData'
import { citiesWithTempleData } from '../data/citiesWithTempleData'
import { deslugify, slugify } from '../utils/slug'
import { useAllTemples } from '../data/useAllTemples'
import TempleTable from '../components/TempleTable'
import IndiaMap from '../components/IndiaMap'

export default function StateDetailPage() {
  const { stateName } = useParams()
  const displayStateName = deslugify(stateName)
  const { allTemples } = useAllTemples()

  const stateData = statesAndCities.find((s) => s.state === displayStateName)
  const stateCitiesWithTemples = citiesWithTempleData.filter((c) => c.state === displayStateName)
  const stateTemples = allTemples.filter((t) => t.state === displayStateName)

  if (!stateData) {
    return (
      <div className="page">
        <p className="status status-error">State not found.</p>
        <Link to="/">← Back to Home</Link>
      </div>
    )
  }

  const handleCityClick = (state, city) => {
    const stateSlug = slugify(state)
    const citySlug = slugify(city)
    window.location.href = `/temples/state/${stateSlug}/city/${citySlug}`
  }

  return (
    <div className="page">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/">← Back to Home</Link>
      </div>

      <div className="detail-title-row">
        <div>
          <h1>{displayStateName}</h1>
          <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '0.5rem' }}>
            <strong>Capital:</strong> {stateData.capital}
          </p>
        </div>
      </div>

      <div className="map-container">
        <IndiaMap onCityClick={handleCityClick} height={400} />
      </div>

      <section className="detail-section">
        <h2>About {displayStateName}</h2>
        <dl className="facts">
          <div className="fact">
            <dt>State</dt>
            <dd>{displayStateName}</dd>
          </div>
          <div className="fact">
            <dt>Capital</dt>
            <dd>{stateData.capital}</dd>
          </div>
          <div className="fact">
            <dt>Coordinates</dt>
            <dd>
              {stateData.lat.toFixed(4)}°N, {stateData.lon.toFixed(4)}°E
            </dd>
          </div>
        </dl>
      </section>

      {stateCitiesWithTemples.length > 0 && (
        <section className="detail-section">
          <h2>Cities with Temple Data</h2>
          <ul className="named-list">
            {stateCitiesWithTemples.map((city) => (
              <li key={city.city}>
                <Link
                  to={`/state/${slugify(city.state)}/city/${slugify(city.city)}`}
                  style={{
                    color: '#0066cc',
                    textDecoration: 'underline',
                  }}
                  className="named-list-name"
                >
                  {city.city}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {stateTemples.length > 0 && (
        <section className="detail-section">
          <TempleTable
            temples={stateTemples}
            title={`All Temples in ${displayStateName}`}
            showStateCity={false}
          />
        </section>
      )}
    </div>
  )
}
