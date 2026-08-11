import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TempleTable({ temples, title = 'Temples', showStateCity = true, format = 'old' }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ROWS_PER_PAGE = 20

  // Filter temples based on search term
  const filteredTemples = useMemo(() => {
    if (!searchTerm.trim()) return temples

    const term = searchTerm.toLowerCase()
    return temples.filter((temple) => {
      const name = format === 'temples2' ? temple.name : temple.name
      const deity = format === 'temples2' ? temple.deity : temple.main_deity
      return (
        (name && name.toLowerCase().includes(term)) ||
        (deity && deity.toLowerCase().includes(term)) ||
        (showStateCity && temple.state && temple.state.toLowerCase().includes(term)) ||
        (showStateCity && temple.town && temple.town.toLowerCase().includes(term)) ||
        (showStateCity && temple.city && temple.city.toLowerCase().includes(term))
      )
    })
  }, [temples, searchTerm, showStateCity, format])

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
    const cityOrTown = format === 'temples2' ? temple.town : temple.city
    const citySlug = slugifyName(cityOrTown)
    const templeSlug = slugifyName(temple.name)
    navigate(`/temple/${stateSlug}/${citySlug}/${templeSlug}`)
  }

  const handleStateClick = (stateName) => {
    const stateSlug = slugifyName(stateName)
    navigate(`/state/${stateSlug}`)
  }

  const handleCityTownClick = (stateName, cityOrTown) => {
    const stateSlug = slugifyName(stateName)
    const citySlug = slugifyName(cityOrTown)
    navigate(`/state/${stateSlug}/${citySlug}`)
  }

  const slugifyName = (text) => {
    if (!text) return ''
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[-\s]+/g, '-')
      .trim('-')
  }

  const linkButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#0066cc',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
    fontSize: 'inherit',
    textAlign: 'left',
  }

  const getDeity = (temple) => {
    return format === 'temples2' ? temple.deity : temple.main_deity
  }

  const getCityOrTown = (temple) => {
    return format === 'temples2' ? temple.town : temple.city
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
                  {format === 'temples2' ? <th>Deity</th> : <th>Main Deity</th>}
                  {showStateCity && <th>State</th>}
                  {showStateCity &&
                    (format === 'temples2' ? <th>Town</th> : <th>City</th>)}
                  {format === 'temples2' && <th>Location Note</th>}
                  <th>Year Constructed</th>
                  <th>Festivals</th>
                  {format !== 'temples2' && <th>Wiki URL</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedTemples.map((temple, idx) => {
                  const key = format === 'temples2'
                    ? `${temple.state}-${temple.town}-${idx}`
                    : `${temple.state}-${temple.city}-${idx}`

                  return (
                    <tr key={key}>
                      <td style={{ textAlign: 'left' }}>
                        <button
                          type="button"
                          onClick={() => handleTempleClick(temple)}
                          style={linkButtonStyle}
                        >
                          {temple.name}
                        </button>
                      </td>
                      <td>{getDeity(temple)}</td>
                      {showStateCity && (
                        <td>
                          <button
                            type="button"
                            onClick={() => handleStateClick(temple.state)}
                            style={linkButtonStyle}
                          >
                            {temple.state}
                          </button>
                        </td>
                      )}
                      {showStateCity && (
                        <td>
                          <button
                            type="button"
                            onClick={() => handleCityTownClick(temple.state, getCityOrTown(temple))}
                            style={linkButtonStyle}
                          >
                            {getCityOrTown(temple)}
                          </button>
                        </td>
                      )}
                      {format === 'temples2' && (
                        <td style={{ fontSize: '0.9rem', color: '#555' }}>
                          {temple.location_note}
                        </td>
                      )}
                      <td>{temple.year_constructed || '—'}</td>
                      <td>
                        {temple.festivals_and_events &&
                        temple.festivals_and_events.length > 0
                          ? temple.festivals_and_events.join(', ')
                          : '—'}
                      </td>
                      {format !== 'temples2' && (
                        <td>
                          {temple.wiki_url ? (
                            <a
                              href={temple.wiki_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Link
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
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
