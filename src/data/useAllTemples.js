import { useState, useEffect } from 'react'
import { citiesWithTempleData } from './citiesWithTempleData'

export function useAllTemples() {
  const [allTemples, setAllTemples] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let isMounted = true

    async function loadAllTemples() {
      try {
        const temples = []

        for (const cityData of citiesWithTempleData) {
          // State filename: spaces are preserved, not converted to underscores
          const stateFilename = `${cityData.state}.json`
          const response = await fetch(`${import.meta.env.BASE_URL}data/temples/${encodeURIComponent(stateFilename)}`)

          if (!response.ok) continue

          const data = await response.json()

          // Extract temples for this specific city
          const cityTemples = data.cities?.[cityData.city] || []
          if (Array.isArray(cityTemples)) {
            cityTemples.forEach((temple) => {
              temples.push({
                ...temple,
                state: cityData.state,
                city: cityData.city,
              })
            })
          }
        }

        if (isMounted) {
          setAllTemples(temples)
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
