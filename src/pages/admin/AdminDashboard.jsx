import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>⚙️ Admin Dashboard</h1>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/" style={{ color: '#0066cc', textDecoration: 'underline' }}>
          ← Back to Home
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {/* Locations Section */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '1.5rem',
          backgroundColor: '#f9f9f9'
        }}>
          <h2 style={{ marginTop: 0, fontSize: '1.3rem', color: '#2c5aa0' }}>
            📍 Locations
          </h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Manage cities and towns in the temples database
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link
              to="/admin/locations"
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#2c5aa0',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            >
              View Locations
            </Link>
            <Link
              to="/admin/locations/add"
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#2e7d32',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            >
              Add Location
            </Link>
          </div>
        </div>

        {/* Temples Section */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '1.5rem',
          backgroundColor: '#f9f9f9'
        }}>
          <h2 style={{ marginTop: 0, fontSize: '1.3rem', color: '#2c5aa0' }}>
            🏛️ Temples
          </h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Manage temples and upload media (photos, videos)
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link
              to="/admin/temples"
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#2c5aa0',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            >
              View Temples
            </Link>
            <Link
              to="/admin/temples/add"
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#2e7d32',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            >
              Add Temple
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        borderLeft: '4px solid #2c5aa0'
      }}>
        <h3 style={{ marginTop: 0 }}>Quick Tips</h3>
        <ul style={{ color: '#333', lineHeight: '1.8' }}>
          <li>Use <strong>Locations</strong> to manage cities and towns</li>
          <li>Use <strong>Temples</strong> to add/edit temple information and upload media</li>
          <li>Search temples by state, location, or name</li>
          <li>Delete multiple temples at once using the bulk delete feature</li>
        </ul>
      </div>
    </div>
  )
}
