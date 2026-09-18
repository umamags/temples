import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TempleForm from '../../components/admin/TempleForm'

export default function AdminTemplesAddPage() {
  const navigate = useNavigate()
  const [successMessage, setSuccessMessage] = useState(null)
  const [newTempleId, setNewTempleId] = useState(null)

  const handleSuccess = (data) => {
    setNewTempleId(data.temple_id)
    setSuccessMessage('Temple added successfully!')
    setTimeout(() => {
      navigate(`/admin/temples/${data.temple_id}/edit`)
    }, 1500)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/temples" style={{ color: '#0066cc', textDecoration: 'underline' }}>
          ← Back to Temples
        </Link>
      </div>

      <h1>🏛️ Add New Temple</h1>

      {successMessage && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d4edda',
          border: '1px solid #2e7d32',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          color: '#2e7d32'
        }}>
          {successMessage}
          {newTempleId && <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>Redirecting to edit page...</p>}
        </div>
      )}

      <TempleForm onSuccess={handleSuccess} onCancel={() => navigate('/admin/temples')} />
    </div>
  )
}
