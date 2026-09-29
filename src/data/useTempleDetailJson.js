import { useState, useEffect } from 'react'

export function useTempleDetailJson(templeId) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadTempleJson() {
      try {
        setStatus('loading')
        setError(null)

        if (!templeId) {
          throw new Error('Temple ID required')
        }

        const response = await fetch(`/temples/data/json/${templeId}.json`)

        if (!response.ok) {
          setStatus('ready')
          setData(null)
          return
        }

        const result = await response.json()

        if (isMounted) {
          setData(result)
          setStatus('ready')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setStatus('ready')
        }
      }
    }

    if (templeId) {
      loadTempleJson()
    }

    return () => {
      isMounted = false
    }
  }, [templeId])

  return { data, status, error }
}
