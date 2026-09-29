import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../../config/apiConfig'

export default function SqlExecutor() {
  const [sql, setSql] = useState('')
  const [name, setName] = useState('')
  const [savedQueries, setSavedQueries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [response, setResponse] = useState(null)
  const [showSaveForm, setShowSaveForm] = useState(false)

  useEffect(() => {
    loadSavedQueries()
  }, [])

  const loadSavedQueries = async () => {
    try {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/backend/admin/manageSqlQueries.php?action=list`)
      const data = await res.json()

      if (data.success) {
        setSavedQueries(data.queries || [])
      }
    } catch (err) {
      console.error('Error loading saved queries:', err)
    }
  }

  const handleLoadQuery = (query) => {
    setSql(query.sql)
    setName(query.name)
    setResponse(null)
  }

  const handleExecute = async () => {
    if (!sql.trim()) {
      setError('Please enter a SQL query')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/backend/admin/executeSql.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sql.trim() })
      })

      const data = await res.json()
      setResponse(data)

      if (!data.success) {
        setError(data.error || 'Query execution failed')
      }
    } catch (err) {
      console.error('Error executing SQL:', err)
      setError('Failed to execute query')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveQuery = async () => {
    if (!name.trim() || !sql.trim()) {
      setError('Please enter a name and SQL')
      return
    }

    try {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/backend/admin/manageSqlQueries.php?action=save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), sql: sql.trim() })
      })

      const data = await res.json()

      if (data.success) {
        setError(null)
        loadSavedQueries()
        setShowSaveForm(false)
        setError(null)
      } else {
        setError(data.error || 'Failed to save query')
      }
    } catch (err) {
      console.error('Error saving query:', err)
      setError('Failed to save query')
    }
  }

  const handleDeleteQuery = async (id) => {
    if (!window.confirm('Delete this query?')) return

    try {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/backend/admin/manageSqlQueries.php?action=delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      const data = await res.json()

      if (data.success) {
        loadSavedQueries()
      } else {
        setError(data.error || 'Failed to delete query')
      }
    } catch (err) {
      console.error('Error deleting query:', err)
      setError('Failed to delete query')
    }
  }

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: '#f0f4f8',
      borderRadius: '8px',
      border: '1px solid #ddd'
    }}>
      <h2 style={{ marginTop: 0, fontSize: '1.3rem', color: '#2c5aa0' }}>
        🗄️ SQL Executor
      </h2>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#ffebee',
          border: '1px solid #c62828',
          borderRadius: '4px',
          marginBottom: '1rem',
          color: '#c62828'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Saved Queries List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #ddd',
          padding: '1rem'
        }}>
          <h4 style={{ marginTop: 0 }}>Saved Queries ({savedQueries.length})</h4>
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            marginBottom: '1rem'
          }}>
            {savedQueries.map(query => (
              <div
                key={query.id}
                style={{
                  padding: '0.75rem',
                  backgroundColor: name === query.name ? '#e3f2fd' : '#f9f9f9',
                  border: name === query.name ? '2px solid #2c5aa0' : '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleLoadQuery(query)}>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#2c5aa0' }}>
                      {query.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                      Updated: {new Date(query.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuery(query.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#ffcdd2',
                      color: '#c62828',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {savedQueries.length === 0 && (
              <p style={{ color: '#999', fontSize: '0.9rem', textAlign: 'center', marginTop: '1rem' }}>
                No saved queries yet
              </p>
            )}
          </div>
        </div>

        {/* SQL Executor */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #ddd',
          padding: '1rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              SQL Query (SELECT only)
            </label>
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              placeholder="SELECT * FROM temples LIMIT 10"
              rows="8"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={handleExecute}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2e7d32',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Executing...' : 'Execute'}
            </button>
            <button
              onClick={() => setShowSaveForm(!showSaveForm)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2c5aa0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showSaveForm ? 'Cancel' : 'Save Query'}
            </button>
          </div>

          {showSaveForm && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              marginBottom: '1rem',
              border: '1px solid #ddd'
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  Query Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., All Temples in Tamil Nadu"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                onClick={handleSaveQuery}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2e7d32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Save
              </button>
            </div>
          )}

          {response && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: response.success ? '#d4edda' : '#ffebee',
              border: `1px solid ${response.success ? '#2e7d32' : '#c62828'}`,
              borderRadius: '4px',
              color: response.success ? '#2e7d32' : '#c62828'
            }}>
              <h5 style={{ marginTop: 0 }}>
                Results ({response.count || 0} rows)
              </h5>

              {response.success && response.rows && response.rows.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.85rem'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                        {Object.keys(response.rows[0]).map(key => (
                          <th
                            key={key}
                            style={{
                              padding: '0.5rem',
                              textAlign: 'left',
                              fontWeight: '600',
                              borderRight: '1px solid #ddd'
                            }}
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {response.rows.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          {Object.values(row).map((val, idx2) => (
                            <td
                              key={idx2}
                              style={{
                                padding: '0.5rem',
                                borderRight: '1px solid #eee',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={val}
                            >
                              {val === null ? <em style={{ color: '#999' }}>null</em> : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : response.success ? (
                <p style={{ color: '#666' }}>No results found</p>
              ) : (
                <p>{response.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
