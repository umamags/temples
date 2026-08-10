import { useState, useEffect } from 'react'
import { statesAndCities } from './statesData'
import { getTemples2FileName } from '../utils/stateFileMapping'

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

export function useTempleDetail2(stateName, townName, templeName) {
  const [temple, setTemple] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadTempleDetail() {
      try {
        setStatus('loading')
        setError(null)

        // stateName might be either slugified or deslugified, try both
        let actualStateName = stateName
        if (!statesAndCities.find((s) => s.state === stateName)) {
          // Try to find by slug
          const found = statesAndCities.find((s) => slugifyName(s.state) === stateName)
          actualStateName = found ? found.state : null
        }

        if (!actualStateName) {
          throw new Error('State not found')
        }

        // Get temples2 filename for this state
        const fileName = getTemples2FileName(actualStateName)
        if (!fileName) {
          throw new Error('State data not found')
        }

        // Load temples2 data
        const response = await fetch(
          `${import.meta.env.BASE_URL}data/temples2/${encodeURIComponent(fileName)}.json`
        )

        if (!response.ok) {
          throw new Error(`Failed to load temple data`)
        }

        const templesData = await response.json()

        // Find the town and temple
        let foundTemple = null
        for (const townData of templesData) {
          // townName might be either slugified or deslugified, compare both ways
          const townDataSlug = slugifyName(townData.town)
          const townNameSlug = slugifyName(townName)
          const townMatches = townDataSlug === townNameSlug || townData.town === townName

          if (townMatches) {
            // Found the town, now find the temple
            // templeName might be either slugified or deslugified
            const templeNameSlug = slugifyName(templeName)
            const templeData = townData.top_temples.find((t) => {
              const tSlug = slugifyName(t.name)
              return tSlug === templeNameSlug || t.name === templeName
            })

            if (templeData) {
              foundTemple = {
                ...templeData,
                state: actualStateName,
                town: townData.town,
                type: townData.type,
                lat: townData.lat,
                lon: townData.lon,
              }
              break
            }
          }
        }

        if (!foundTemple) {
          throw new Error('Temple not found')
        }

        if (isMounted) {
          setTemple(foundTemple)
          setStatus('ready')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setStatus('error')
        }
      }
    }

    if (stateName && townName && templeName) {
      loadTempleDetail()
    }

    return () => {
      isMounted = false
    }
  }, [stateName, townName, templeName])

  return { temple, status, error }
}
