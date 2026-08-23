import { useSearchParams, Link } from 'react-router-dom'
import { useAllTemples } from '../data/useAllTemples'
import TempleTable from '../components/TempleTable'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { allTemples, status } = useAllTemples()

  const filteredTemples = allTemples.filter((temple) => {
    if (!query.trim()) return false

    const term = query.toLowerCase()
    return (
      (temple.name && temple.name.toLowerCase().includes(term)) ||
      (temple.deity && temple.deity.toLowerCase().includes(term)) ||
      (temple.state && temple.state.toLowerCase().includes(term)) ||
      (temple.town && temple.town.toLowerCase().includes(term))
    )
  })

  return (
    <div className="page">
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
        <Link to="/" style={{ color: '#0066cc', textDecoration: 'none' }}>Home</Link>
        <span> / Search Results</span>
      </nav>

      <h1>Search Results</h1>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1.5rem' }}>
        {query ? `Showing results for "${query}"` : 'No search term provided'}
      </p>

      {status === 'loading' && <p>Loading temples...</p>}
      {status === 'error' && <p style={{ color: '#d32f2f' }}>Error loading temples</p>}

      {query.trim() && filteredTemples.length === 0 ? (
        <div style={{
          padding: '2rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          textAlign: 'center',
          color: '#666',
        }}>
          <p>No temples found matching "{query}"</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Try different keywords or check the spelling
          </p>
        </div>
      ) : (
        status === 'ready' && query.trim() && (
          <section className="detail-section">
            <TempleTable
              temples={filteredTemples}
              title={`${filteredTemples.length} Temple${filteredTemples.length !== 1 ? 's' : ''} Found`}
              showStateCity={true}
              format="temples2"
            />
          </section>
        )
      )}
    </div>
  )
}
