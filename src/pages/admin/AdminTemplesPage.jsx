import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiBaseUrl } from '../../config/apiConfig'
import TempleSearchForm from '../../components/admin/TempleSearchForm'

export default function AdminTemplesPage() {
  const navigate = useNavigate()
  const [temples, setTemples] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deleteMessage, setDeleteMessage] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())

  const handleSearch = async (filters) => {
    setLoading(true)
    setError(null)
    setSelectedIds(new Set())

    try {
      const baseUrl = getApiBaseUrl()
      const params = new URLSearchParams()

      if (filters.state_id) params.append('state_id', filters.state_id)
      if (filters.location_id) params.append('location_id', filters.location_id)
      if (filters.name) params.append('name', filters.name)

      const response = await fetch(
        `${baseUrl}/backend/query/searchTemples.php?${params.toString()}`
      )
      const data = await response.json()

      if (data.success) {
        setTemples(data.data || [])
      } else {
        setError('Search failed')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (templeId) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(templeId)) {
      newSelected.delete(templeId)
    } else {
      newSelected.add(templeId)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === temples.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(temples.map(t => t.id)))
    }
  }

  const handleDelete = async (templeId) => {
    if (!window.confirm('Delete this temple?')) return
    await deleteTemples([templeId])
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      setError('No temples selected')
      return
    }

    if (!window.confirm(`Delete ${selectedIds.size} selected temple(s)?`)) return
    await deleteTemples(Array.from(selectedIds))
  }

  const deleteTemples = async (templeIds) => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/backend/edit/deleteTemple.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          templeIds.length === 1
            ? { temple_id: templeIds[0] }
            : { temple_ids: templeIds }
        )
      })

      const data = await response.json()

      if (data.success) {
        setDeleteMessage(`${data.data.deleted_count} temple(s) deleted successfully!`)
        setTimeout(() => {
          setDeleteMessage(null)
          handleSearch({ state_id: '', location_id: '', name: '' })
        }, 2000)
      } else {
        setError(data.error || 'Failed to delete')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete temples')
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin" style={{ color: '#0066cc', textDecoration: 'underline' }}>
          ← Back to Admin
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>🏛️ Manage Temples</h1>
        <Link
          to="/admin/temples/add"
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#2e7d32',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          + Add Temple
        </Link>
      </div>

      {deleteMessage && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d4edda',
          border: '1px solid #2e7d32',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          color: '#2e7d32'
        }}>
          ✓ {deleteMessage}
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#ffebee',
          border: '1px solid #c62828',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          color: '#c62828'
        }}>
          {error}
        </div>
      )}

      <TempleSearchForm onSearch={handleSearch} />

      {loading && <p>Searching temples...</p>}

      {temples.length > 0 && (
        <>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>
              Found <strong>{temples.length}</strong> temple(s)
              {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
            </span>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#c62828',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Delete Selected
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#2c5aa0', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #ddd', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.size === temples.length && temples.length > 0}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Temple</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Location</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>State</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Deity</th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {temples.map((temple) => (
                  <tr key={temple.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(temple.id)}
                        onChange={() => toggleSelect(temple.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <strong>{temple.name}</strong>
                    </td>
                    <td style={{ padding: '1rem' }}>{temple.location_name}</td>
                    <td style={{ padding: '1rem' }}>{temple.state_name}</td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                      {temple.deity || '—'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => navigate(`/admin/temples/${temple.id}/edit`)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#2c5aa0',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '0.5rem',
                          fontSize: '0.85rem'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(temple.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#c62828',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && temples.length === 0 && (
        <div style={{
          padding: '2rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          <p>No temples found. Try adjusting your search filters.</p>
        </div>
      )}
    </div>
  )
}
