import { useState, useEffect } from 'react'
import { statesAndCities } from './statesData'

export function useTempleDetail(stateName, cityName, templeName) {
  const [temple, setTemple] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadTempleDetail() {
      try {
        setStatus('loading')
        setError(null)

        // Get actual state name from slug
        const actualStateName = getActualStateName(stateName)
        if (!actualStateName) {
          throw new Error('State not found')
        }

        // Load temple data from state/city JSON
        const stateFilename = `${actualStateName}.json`
        const response = await fetch(
          `${import.meta.env.BASE_URL}data/temples/${encodeURIComponent(stateFilename)}`
        )

        if (!response.ok) {
          throw new Error(`Failed to load temple data for ${stateName}`)
        }

        const data = await response.json()

        // Find actual city name from slug by checking all cities
        const actualCityName = Object.keys(data.cities).find(
          (city) => slugifyName(city) === cityName
        )
        if (!actualCityName) {
          throw new Error('City not found')
        }

        const cityTemples = data.cities[actualCityName] || []
        const templeData = cityTemples.find((t) => slugifyName(t.name) === templeName)

        if (!templeData) {
          throw new Error('Temple not found')
        }

        if (isMounted) {
          setTemple({
            ...templeData,
            state: actualStateName,
            city: actualCityName,
          })
          setStatus('ready')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setStatus('error')
        }
      }
    }

    if (stateName && cityName && templeName) {
      loadTempleDetail()
    }

    return () => {
      isMounted = false
    }
  }, [stateName, cityName, templeName])

  return { temple, status, error }
}

function slugifyName(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[-\s]+/g, '-')
    .trim('-')
}

function getActualStateName(slug) {
  const state = statesAndCities.find((s) => slugifyName(s.state) === slug)
  return state ? state.state : null
}
