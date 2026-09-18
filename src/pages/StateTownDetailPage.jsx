import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTemples } from '../data/useTemples'
import TempleTable from '../components/TempleTable'
import LeafletMap from '../components/LeafletMap'

export default function StateTownDetailPage() {
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

  const { temples: townTemples, status, error, city } = useTemples(parseInt(cityId))

  if (status === 'error') {
    return (
      <div className="page">
        <p className="status status-error">{error || 'Failed to load city'}</p>
        <Link to="/">← Back to Home</Link>
      </div>
    )
  }

  const cityName = city?.name || 'Loading...'
  const stateName = city?.state || 'Loading...'
  const stateId = city?.state_id

  return (
    <div className="page">
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
        <Link to="/" style={{ color: '#0066cc', textDecoration: 'none' }}>Home</Link>
        <span> / </span>
        {stateId && (
          <>
            <Link to={`/state/${stateId}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
              {stateName}
            </Link>
            <span> / </span>
          </>
        )}
        <span>{cityName}</span>
      </nav>

      <div style={{ marginBottom: '2rem' }}>
        <h1>{cityName}</h1>
        {stateName && <p style={{ fontSize: '1.1rem', color: '#666' }}>{stateName}</p>}
      </div>

      {status === 'loading' && <p>Loading temples...</p>}

      {status === 'ready' && townTemples.length > 0 && (
        <>
          {city?.lat && city?.lon && (
            <LeafletMap lat={city.lat} lng={city.lon} title={`${cityName} Location`} />
          )}

          <section className="detail-section">
            <TempleTable
              temples={townTemples}
              title={`All Temples in ${cityName}`}
              showStateCity={true}
              format="temples2"
            />
          </section>
        </>
      )}

      {status === 'ready' && townTemples.length === 0 && (
        <p style={{ color: '#666' }}>No temples found in {cityName}</p>
      )}
    </div>
  )
}
