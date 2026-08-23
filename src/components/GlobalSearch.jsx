import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input
        type="text"
        placeholder="Search temples, deities..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleSearch}
        style={{
          padding: '0.4rem 0.6rem',
          fontSize: '0.95rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '250px',
        }}
      />
      <button
        onClick={handleSearchClick}
        style={{
          padding: '0.4rem 0.8rem',
          fontSize: '0.95rem',
          backgroundColor: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '500',
        }}
      >
        Search
      </button>
    </div>
  )
}
