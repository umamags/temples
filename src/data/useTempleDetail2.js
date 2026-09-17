import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../config/apiConfig'

export function useTempleDetail2(templeId) {
  const [temple, setTemple] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadTempleDetail() {
      try {
        setStatus('loading')
        setError(null)

        if (!templeId) {
          throw new Error('Temple ID required')
        }

        const baseUrl = getApiBaseUrl()
        const response = await fetch(
          `${baseUrl}/backend/query/getTempleDetail.php?temple_id=${templeId}`
        )

        if (!response.ok) {
          throw new Error(`Failed to load temple data`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Temple not found')
        }

        if (isMounted) {
          setTemple(result.data)
          setStatus('ready')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setStatus('error')
        }
      }
    }

    if (templeId) {
      loadTempleDetail()
    }

    return () => {
      isMounted = false
    }
  }, [templeId])

  return { temple, status, error }
}
