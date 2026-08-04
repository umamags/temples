import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TempleTable({ temples, title = 'Temples', showStateCity = true }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ROWS_PER_PAGE = 20

  // Filter temples based on search term
  const filteredTemples = useMemo(() => {
    if (!searchTerm.trim()) return temples

    const term = searchTerm.toLowerCase()
    return temples.filter((temple) => {
      return (
        (temple.name && temple.name.toLowerCase().includes(term)) ||
        (temple.main_deity && temple.main_deity.toLowerCase().includes(term)) ||
        (showStateCity && temple.state && temple.state.toLowerCase().includes(term)) ||
        (showStateCity && temple.city && temple.city.toLowerCase().includes(term))
      )
    })
  }, [temples, searchTerm, showStateCity])

  // Paginate
  const totalPages = Math.ceil(filteredTemples.length / ROWS_PER_PAGE)
  const startIdx = (currentPage - 1) * ROWS_PER_PAGE
  const paginatedTemples = filteredTemples.slice(startIdx, startIdx + ROWS_PER_PAGE)

  // Reset to page 1 when search changes
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleTempleClick = (temple) => {
    const stateSlug = slugifyName(temple.state)
    const citySlug = slugifyName(temple.city)
    const templeSlug = slugifyName(temple.name)
    navigate(`/temple/${stateSlug}/${citySlug}/${templeSlug}`)
  }

  const slugifyName = (text) => {
    if (!text) return ''
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[-\s]+/g, '-')
      .trim('-')
  }

  return (
    <div className="temple-table-container">
      <h2>{title}</h2>

      <div className="search-container" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by temple name, deity, state, or city..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {filteredTemples.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
          {searchTerm ? 'No temples found matching your search.' : 'No temples available.'}
        </p>
      ) : (
        <>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="temple-data-table">
              <thead>
                <tr>
                  <th>Temple Name</th>
                  <th>Main Deity</th>
                  {showStateCity && <th>State</th>}
                  {showStateCity && <th>City</th>}
                  <th>Year Constructed</th>
                  <th>Festivals</th>
                  <th>Wiki URL</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTemples.map((temple, idx) => (
                  <tr key={`${temple.state}-${temple.city}-${idx}`}>
                    <td style={{ textAlign: 'left' }}>
                      <button
                        type="button"
                        onClick={() => handleTempleClick(temple)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0066cc',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                          fontSize: 'inherit',
                          textAlign: 'left',
                        }}
                      >
                        {temple.name}
                      </button>
                    </td>
                    <td>{temple.main_deity}</td>
                    {showStateCity && <td>{temple.state}</td>}
                    {showStateCity && <td>{temple.city}</td>}
                    <td>{temple.year_constructed || '—'}</td>
                    <td>
                      {temple.festivals_and_events && temple.festivals_and_events.length > 0
                        ? temple.festivals_and_events.join(', ')
                        : '—'}
                    </td>
                    <td>
                      {temple.wiki_url ? (
                        <a href={temple.wiki_url} target="_blank" rel="noopener noreferrer">
                          Link
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem', color: '#666' }}>
              Showing {startIdx + 1} to {Math.min(startIdx + ROWS_PER_PAGE, filteredTemples.length)} of{' '}
              {filteredTemples.length} temples
            </div>
            <div>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  marginRight: '0.5rem',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                ← Previous
              </button>

              <span style={{ margin: '0 1rem', color: '#666' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  marginLeft: '0.5rem',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
