import { Link, useParams, useNavigate } from 'react-router-dom'
import { useStateTemples2 } from '../data/useStateTemples2'
import TempleTable from '../components/TempleTable'
import StatePinMap from '../components/StatePinMap'

export default function StateDetailPage() {
  const { stateId } = useParams()
  const navigate = useNavigate()

  if (!stateId) {
    return <div className="page"><p>No state ID provided</p></div>
  }

  const { temples: stateTemples, status, state } = useStateTemples2(parseInt(stateId))

  if (status === 'error') {
    return (
      <div className="page">
        <p className="status status-error">Failed to load state</p>
        <Link to="/">Back to Home</Link>
      </div>
    )
  }

  const stateName = state?.name || 'Loading...'

  const handlePinClick = (town) => {
    navigate(`/city/${town.location_id}`)
  }

  const uniqueTowns = stateTemples.reduce((acc, temple) => {
    const exists = acc.find((t) => t.location_id === temple.location_id)
    if (!exists) {
      acc.push({
        town: temple.town,
        location_id: temple.location_id,
        type: temple.type,
        lat: temple.lat,
        lon: temple.lon,
      })
    }
    return acc
  }, [])

  return (
    <div className="page">
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
        <Link to="/" style={{ color: '#0066cc', textDecoration: 'none' }}>Home</Link>
        <span> / {stateName}</span>
      </nav>

      <h1>{stateName}</h1>

      <div className="map-container">
        {status === 'loading' && <p>Loading temples...</p>}
        {status === 'error' && <p>Error loading temples</p>}
        {status === 'ready' && <p>Found {stateTemples.length} temples in {uniqueTowns.length} locations</p>}
        {status === 'ready' && uniqueTowns.length > 0 && (
          <StatePinMap
            stateName={stateName}
            towns={uniqueTowns}
            onPinClick={handlePinClick}
            height={400}
          />
        )}
      </div>

      {stateTemples.length > 0 && (
        <section className="detail-section">
          <TempleTable
            temples={stateTemples}
            title={`All Temples in ${stateName}`}
            showStateCity={true}
            format="temples2"
          />
        </section>
      )}
    </div>
  )
}
