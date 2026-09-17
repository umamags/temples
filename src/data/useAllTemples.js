import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../config/apiConfig'

export function useAllTemples() {
  const [allTemples, setAllTemples] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let isMounted = true

    async function loadAllTemples() {
      try {
        const baseUrl = getApiBaseUrl()
        const response = await fetch(`${baseUrl}/backend/query/getAllTemples.php`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to load temples')
        }

        if (isMounted) {
          setAllTemples(result.data || [])
          setStatus('ready')
        }
      } catch (err) {
        console.error('Failed to load temples:', err)
        if (isMounted) {
          setStatus('error')
        }
      }
    }

    loadAllTemples()

    return () => {
      isMounted = false
    }
  }, [])

  return { allTemples, status }
}
