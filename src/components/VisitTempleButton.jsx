import { useState, useMemo } from 'react'
import { useUser } from '../hooks/useUser'
import { useVisitedTemples } from '../hooks/useVisitedTemples'
import { getApiBaseUrl } from '../config/apiConfig'

export default function VisitTempleButton({ templeId, templeName, templeData, onVisitSuccess }) {
  const { user, setUserData } = useUser()
  const { toggleVisited, isVisited } = useVisitedTemples()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const visited = useMemo(() => {
    return templeData ? isVisited(templeData, 'temples2') : false
  }, [templeData, isVisited])

  const handleVisitClick = async () => {
    setError(null)

    try {
      let currentUser = user

      if (!currentUser) {
        const username = prompt('Please enter your username:')
        if (!username) {
          return
        }

        if (username.trim().length === 0) {
          setError('Username cannot be empty')
          return
        }

        setIsLoading(true)

        const baseUrl = getApiBaseUrl()
        const userResponse = await fetch(`${baseUrl}/backend/edit/addUser.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        })

        const userData = await userResponse.json()

        if (!userData.success) {
          setError(userData.error || 'Failed to create user')
          setIsLoading(false)
          return
        }

        currentUser = userData.data
        setUserData(currentUser)
      }

      setIsLoading(true)
      const baseUrl = getApiBaseUrl()
      const visitResponse = await fetch(`${baseUrl}/backend/edit/addVisitedTemple.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          temple_id: templeId
        })
      })

      const visitData = await visitResponse.json()

      if (!visitData.success) {
        setError(visitData.error || 'Failed to mark temple as visited')
        setIsLoading(false)
        return
      }

      if (templeData) {
        toggleVisited(templeData, 'temples2')
      }
      setIsLoading(false)
      if (onVisitSuccess) {
        onVisitSuccess()
      }
    } catch (err) {
      console.error('Error visiting temple:', err)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  if (visited) {
    return (
      <div style={{
        display: 'inline-block',
        padding: '0.5rem 1rem',
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '4px',
        color: '#155724',
        fontWeight: 'bold',
      }}>
        ✓ Visited!
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleVisitClick}
        disabled={isLoading}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: isLoading ? '#ccc' : '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: '500',
          transition: 'background-color 0.2s ease',
        }}
      >
        {isLoading ? 'Processing...' : 'I have visited this temple!'}
      </button>
      {error && (
        <p style={{ color: '#d32f2f', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          {error}
        </p>
      )}
    </div>
  )
}
