import { useState, useEffect } from 'react'
import { statesAndCities } from './statesData'
import { getTemples2FileName } from '../utils/stateFileMapping'

export function useAllTemples() {
  const [allTemples, setAllTemples] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let isMounted = true

    async function loadAllTemples() {
      try {
        const temples = []

        for (const stateData of statesAndCities) {
          const fileName = getTemples2FileName(stateData.state)
          if (!fileName) continue

          const response = await fetch(
            `${import.meta.env.BASE_URL}data/temples2/${encodeURIComponent(fileName)}.json`
          )

          if (!response.ok) continue

          const data = await response.json()

          // data is an array of towns with top_temples
          if (Array.isArray(data)) {
            data.forEach((townData) => {
              if (Array.isArray(townData.top_temples)) {
                townData.top_temples.forEach((temple) => {
                  temples.push({
                    ...temple,
                    state: stateData.state,
                    town: townData.town,
                    type: townData.type,
                    lat: townData.lat,
                    lon: townData.lon,
                  })
                })
              }
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
