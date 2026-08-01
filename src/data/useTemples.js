import { useState, useEffect } from 'react'

export function useTemples(state, city) {
  const [temples, setTemples] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadTemples() {
      try {
        setStatus('loading')
        // Properly encode state name for file path
        const stateFilename = `${state}.json`
        const response = await fetch(`${import.meta.env.BASE_URL}data/temples/${encodeURIComponent(stateFilename)}`)

        if (!response.ok) {
          throw new Error(`Failed to load temples for ${state}`)
        }

        const data = await response.json()
        const cityTemples = data.cities[city] || []

        if (isMounted) {
          setTemples(cityTemples)
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

    if (state && city) {
      loadTemples()
    }

    return () => {
      isMounted = false
    }
  }, [state, city])

  return { temples, status, error }
}
