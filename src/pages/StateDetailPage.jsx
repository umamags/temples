import { Link, useParams } from 'react-router-dom'
import { statesAndCities } from '../data/statesData'
import { deslugify, slugify } from '../utils/slug'
import { useStateTemples2 } from '../data/useStateTemples2'
import TempleTable from '../components/TempleTable'
import StatePinMap from '../components/StatePinMap'

export default function StateDetailPage() {
  const { stateName } = useParams()

  if (!stateName) {
    return <div className="page"><p>No state name provided</p></div>
  }

  const displayStateName = deslugify(stateName)
  const { temples: stateTemples, status } = useStateTemples2(displayStateName)
  const stateData = statesAndCities.find((s) => s.state === displayStateName)

  if (!stateData) {
    return (
      <div className="page">
        <p className="status status-error">State not found</p>
        <Link to="/">Back to Home</Link>
      </div>
    )
  }

  const handlePinClick = (town) => {
    const stateSlug = slugify(displayStateName)
    const townSlug = slugify(town.town)
    window.location.href = `/temples/state/${stateSlug}/town/${townSlug}`
  }

  const uniqueTowns = stateTemples.reduce((acc, temple) => {
    const exists = acc.find((t) => t.town === temple.town && t.type === temple.type)
    if (!exists) {
      acc.push({
        town: temple.town,
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
        <span> / {displayStateName}</span>
      </nav>

      <h1>{displayStateName}</h1>
      <p>Capital: {stateData.capital}</p>

      <div className="map-container">
        {status === 'loading' && <p>Loading temples...</p>}
        {status === 'error' && <p>Error loading temples</p>}
        {status === 'ready' && <p>Found {stateTemples.length} temples in {uniqueTowns.length} towns</p>}
        {status === 'ready' && uniqueTowns.length > 0 && (
          <StatePinMap
            stateName={displayStateName}
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
            title={`All Temples in ${displayStateName}`}
            showStateCity={true}
            format="temples2"
          />
        </section>
      )}
    </div>
  )
}
