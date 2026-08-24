import { Link, useParams } from 'react-router-dom'
import { statesAndCities } from '../data/statesData'
import { deslugify } from '../utils/slug'
import { useStateTemples2 } from '../data/useStateTemples2'
import TempleTable from '../components/TempleTable'
import LeafletMap from '../components/LeafletMap'

export default function StateTownDetailPage() {
  const { stateName, townName } = useParams()
  const displayStateName = deslugify(stateName)
  const displayTownName = deslugify(townName)

  const { temples: allStateTemples, status } = useStateTemples2(displayStateName)
  const stateData = statesAndCities.find((s) => s.state === displayStateName)

  // Filter temples for this specific town
  const townTemples = allStateTemples.filter((t) => t.town === displayTownName)

  // Get town type and coordinates
  const townData = allStateTemples.find((t) => t.town === displayTownName)

  if (!stateData) {
    return (
      <div className="page">
        <p className="status status-error">State not found</p>
        <Link to="/">← Back to Home</Link>
      </div>
    )
  }

  if (!townData) {
    return (
      <div className="page">
        <p className="status status-error">Town not found</p>
        <Link to={`/state/${stateName}`}>← Back to {displayStateName}</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
        <Link to="/" style={{ color: '#0066cc', textDecoration: 'none' }}>Home</Link>
        <span> / </span>
        <Link to={`/state/${stateName}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
          {displayStateName}
        </Link>
        <span> / {displayTownName}</span>
      </nav>

      <div className="detail-title-row">
        <div>
          <h1>{displayTownName}</h1>
          <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '0.5rem' }}>
            <strong>State:</strong> {displayStateName} | <strong>Type:</strong> {townData.type}
          </p>
        </div>
      </div>

      <section className="detail-section">
        <h2>About {displayTownName}</h2>
        <dl className="facts">
          <div className="fact">
            <dt>Town</dt>
            <dd>{displayTownName}</dd>
          </div>
          <div className="fact">
            <dt>State</dt>
            <dd>{displayStateName}</dd>
          </div>
          <div className="fact">
            <dt>Type</dt>
            <dd>{townData.type}</dd>
          </div>
          <div className="fact">
            <dt>Coordinates</dt>
            <dd>
              {townData.lat.toFixed(4)}°N, {townData.lon.toFixed(4)}°E
            </dd>
          </div>
        </dl>
      </section>

      <section className="detail-section">
        <LeafletMap lat={townData.lat} lng={townData.lon} title={`${displayTownName} Location`} />
      </section>

      {status === 'loading' && <p>Loading temples...</p>}
      {status === 'error' && <p>Error loading temples</p>}

      {townTemples.length > 0 && (
        <section className="detail-section">
          <TempleTable
            temples={townTemples}
            title={`Temples in ${displayTownName}`}
            showStateCity={false}
            format="temples2"
          />
        </section>
      )}

      {status === 'ready' && townTemples.length === 0 && (
        <section className="detail-section">
          <p>No temples found for {displayTownName}</p>
        </section>
      )}
    </div>
  )
}
