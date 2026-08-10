import { useParams, Link } from 'react-router-dom'
import { deslugify, slugify } from '../utils/slug'
import { useTempleDetail2 } from '../data/useTempleDetail2'
import TempleImageGallery from '../components/TempleImageGallery'

export default function TempleDetailPage() {
  const { stateName, cityName, templeName } = useParams()
  const displayStateName = deslugify(stateName)
  const displayTownName = deslugify(cityName) // Use cityName param as townName
  const displayTempleName = deslugify(templeName)

  const { temple, status, error } = useTempleDetail2(displayStateName, cityName, templeName)

  if (status === 'loading') {
    return (
      <div className="page">
        <p>Loading temple details...</p>
      </div>
    )
  }

  if (error || status === 'error') {
    return (
      <div className="page">
        <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <Link to="/">Home</Link> /
          <Link to={`/state/${stateName}`}> {displayStateName}</Link> /
          <Link to={`/state/${stateName}/town/${cityName}`}> {displayTownName}</Link> /
          <span> Temple</span>
        </nav>
        <h1>Temple Not Found</h1>
        <p style={{ color: '#d32f2f', marginTop: '1rem' }}>
          {error || 'Could not load temple details.'}
        </p>
        <Link to={`/state/${stateName}/town/${cityName}`} style={{ display: 'inline-block', marginTop: '1rem', color: '#0066cc', textDecoration: 'underline' }}>
          ← Back to {displayTownName}
        </Link>
      </div>
    )
  }

  if (!temple) {
    return (
      <div className="page">
        <p>No temple data available.</p>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Breadcrumbs */}
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
        <Link to="/" style={{ color: '#0066cc', textDecoration: 'none' }}>Home</Link>
        <span> / </span>
        <Link to={`/state/${stateName}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
          {displayStateName}
        </Link>
        <span> / </span>
        <Link to={`/state/${stateName}/town/${cityName}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
          {displayTownName}
        </Link>
        <span> / {displayTempleName}</span>
      </nav>

      <div className="temple-detail-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Temple Header */}
        <div style={{ borderBottom: '2px solid #e0e0e0', paddingBottom: '2rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>
            {temple.name}
          </h1>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Deity
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>{temple.deity}</p>
            </div>

            <div>
              <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Location
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>
                {displayTownName}, <strong>{displayStateName}</strong>
              </p>
            </div>

            {temple.type && (
              <div>
                <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Place Type
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>{temple.type}</p>
              </div>
            )}

            {temple.year_constructed && (
              <div>
                <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Year Constructed
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>{temple.year_constructed}</p>
              </div>
            )}

            {temple.lat && temple.lon && (
              <div>
                <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Coordinates
                </h3>
                <p style={{ fontSize: '1rem', color: '#1a1a1a' }}>
                  {temple.lat.toFixed(4)}°N, {temple.lon.toFixed(4)}°E
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Location Note */}
        {temple.location_note && (
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>About</h2>
            <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#444' }}>
              {temple.location_note}
            </p>
          </div>
        )}

        {/* Festivals */}
        {temple.festivals_and_events && temple.festivals_and_events.length > 0 && (
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Festivals & Events</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {temple.festivals_and_events.map((festival) => (
                <span
                  key={festival}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '20px',
                    fontSize: '0.95rem',
                    color: '#333',
                  }}
                >
                  {festival}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Image Gallery and Upload */}
        <TempleImageGallery
          stateName={displayStateName}
          townName={displayTownName}
          templeName={temple.name}
        />

        {/* Back Button */}
        <div style={{ marginTop: '2rem', paddingTop: '2rem' }}>
          <Link
            to={`/state/${stateName}/town/${cityName}`}
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f0f0f0',
              color: '#0066cc',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500',
            }}
          >
            ← Back to {displayTownName}
          </Link>
        </div>
      </div>
    </div>
  )
}
