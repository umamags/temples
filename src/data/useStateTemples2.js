import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../config/apiConfig'

export function useStateTemples2(stateId) {
  const [temples, setTemples] = useState([])
  const [status, setStatus] = useState('loading')
  const [state, setState] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadStateTemples() {
      try {
        if (!stateId) {
          setTemples([])
          setStatus('ready')
          return
        }

        const baseUrl = getApiBaseUrl()
        const response = await fetch(
          `${baseUrl}/backend/query/getStateTemples.php?state_id=${stateId}`
        )

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to load temples')
        }

        if (isMounted) {
          setTemples(result.data || [])
          // Store state info from first temple if available
          if (result.data && result.data.length > 0) {
            setState({
              id: stateId,
              name: result.data[0].state
            })
          }
          setStatus('ready')
        }
      } catch (err) {
        console.error('Failed to load state temples:', err)
        if (isMounted) {
          setStatus('error')
        }
      }
    }

    loadStateTemples()

    return () => {
      isMounted = false
    }
  }, [stateId])

  return { temples, status, state }
}
