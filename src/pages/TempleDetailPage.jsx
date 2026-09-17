import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTempleDetail2 } from '../data/useTempleDetail2'
import TempleImageGallery from '../components/TempleImageGallery'
import LeafletMap from '../components/LeafletMap'

export default function TempleDetailPage() {
  const { templeId } = useParams()
  const navigate = useNavigate()

  const { temple, status, error } = useTempleDetail2(parseInt(templeId))

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
          <Link to="/">Home</Link>
        </nav>
        <h1>Temple Not Found</h1>
        <p style={{ color: '#d32f2f', marginTop: '1rem' }}>
          {error || 'Could not load temple details.'}
        </p>
        <Link to="/" style={{ display: 'inline-block', marginTop: '1rem', color: '#0066cc', textDecoration: 'underline' }}>
          ← Back to Home
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

  const handleBackClick = () => {
    if (temple.location_id) {
      navigate(`/city/${temple.location_id}`)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="page">
      {/* Breadcrumbs */}
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
        <Link to="/" style={{ color: '#0066cc', textDecoration: 'none' }}>Home</Link>
        <span> / </span>
        <Link
          to={`/state/${temple.state_id}`}
          style={{ color: '#0066cc', textDecoration: 'none' }}
        >
          {temple.state}
        </Link>
        <span> / </span>
        <Link
          to={`/city/${temple.location_id}`}
          style={{ color: '#0066cc', textDecoration: 'none' }}
        >
          {temple.city}
        </Link>
        <span> / {temple.name}</span>
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
            {temple.deity && (
              <div>
                <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Deity
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>{temple.deity}</p>
              </div>
            )}

            <div>
              <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Location
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>
                {temple.city}, <strong>{temple.state}</strong>
              </p>
            </div>

            {temple.type && (
              <div>
                <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Type
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#1a1a1a', textTransform: 'capitalize' }}>
                  {temple.type}
                </p>
              </div>
            )}

            {temple.year_constructed && (
              <div>
                <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Period
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>
                  {temple.year_constructed}
                  {temple.year_constructed < 1000 ? ' CE' : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {temple.location_note && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#1a1a1a' }}>
              About This Temple
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#333' }}>
              {temple.location_note}
            </p>
          </section>
        )}

        {/* Festivals */}
        {temple.festivals_and_events && temple.festivals_and_events.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#1a1a1a' }}>
              Festivals & Events
            </h2>
            <ul style={{ marginLeft: '1.5rem' }}>
              {temple.festivals_and_events.map((event, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem', color: '#333' }}>
                  {typeof event === 'string' ? event : event.name || JSON.stringify(event)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Website Link */}
        {temple.website && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#1a1a1a' }}>
              Visit
            </h2>
            <p>
              <a
                href={temple.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0066cc', textDecoration: 'underline' }}
              >
                Official Website →
              </a>
            </p>
          </section>
        )}

        {/* Image Gallery */}
        {temple.image_url && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#1a1a1a' }}>
              Gallery
            </h2>
            <img
              src={temple.image_url}
              alt={temple.name}
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
            />
          </section>
        )}

        {/* Map */}
        {temple.lat && temple.lon && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#1a1a1a' }}>
              Location Map
            </h2>
            <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
              <LeafletMap
                locations={[temple]}
                center={[temple.lat, temple.lon]}
                zoom={12}
              />
            </div>
          </section>
        )}

        {/* Back Button */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #ddd' }}>
          <button
            onClick={handleBackClick}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              color: '#333',
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}
