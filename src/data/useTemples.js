import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../config/apiConfig'

export function useTemples(cityId) {
  const [temples, setTemples] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [city, setCity] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadTemples() {
      try {
        setStatus('loading')
        const baseUrl = getApiBaseUrl()
        const response = await fetch(
          `${baseUrl}/backend/query/getCityTemples.php?city_id=${cityId}`
        )

        if (!response.ok) {
          throw new Error(`Failed to load temples for city ${cityId}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to load temples')
        }

        if (isMounted) {
          setTemples(result.data || [])
          // Store city info from first temple if available
          if (result.data && result.data.length > 0) {
            const cityData = {
              id: cityId,
              name: result.data[0].city,
              state: result.data[0].state,
              state_id: result.data[0].state_id,
              lat: result.data[0].lat,
              lon: result.data[0].lon
            }
            setCity(cityData)
          }
          setStatus('ready')
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setStatus('error')
          setTemples([])
        }
      }
    }

    if (cityId) {
      loadTemples()
    }

    return () => {
      isMounted = false
    }
  }, [cityId])

  return { temples, status, error, city }
}
