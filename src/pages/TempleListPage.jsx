import { Link, useParams } from 'react-router-dom'
import { deslugify, slugify } from '../utils/slug'
import { useStateTemples2 } from '../data/useStateTemples2'
import TempleTable from '../components/TempleTable'

export default function TempleListPage() {
  const { stateName } = useParams()
  const displayStateName = deslugify(stateName)

  const { temples, status, error } = useStateTemples2(displayStateName)

  if (error || !temples) {
    return (
      <div className="page">
        <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <Link to="/">Home</Link> / <span>Temples</span>
        </nav>
        <h1>Temples Not Found</h1>
        <p style={{ color: '#d32f2f', marginTop: '1rem' }}>{error || 'Could not load temples.'}</p>
        <Link to="/" style={{ display: 'inline-block', marginTop: '1rem', color: '#0066cc', textDecoration: 'underline' }}>
          ← Back to Home
        </Link>
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
        <span> / Temples</span>
      </nav>

      <div className="detail-title-row">
        <div>
          <h1>Temples in {displayStateName}</h1>
          <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '0.5rem' }}>
            All temples across {displayStateName}
          </p>
        </div>
      </div>

      {status === 'loading' && <p>Loading temples...</p>}
      {status === 'error' && <p>Error loading temples</p>}

      {temples && temples.length > 0 && (
        <section className="detail-section">
          <TempleTable
            temples={temples}
            title={`All Temples in ${displayStateName}`}
            showStateCity={true}
            format="temples2"
          />
        </section>
      )}

      {status === 'ready' && temples && temples.length === 0 && (
        <section className="detail-section">
          <p>No temples found for {displayStateName}</p>
        </section>
      )}

      <div style={{ marginTop: '2rem', paddingTop: '2rem' }}>
        <Link
          to={`/state/${stateName}`}
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
          ← Back to {displayStateName}
        </Link>
      </div>
    </div>
  )
}
