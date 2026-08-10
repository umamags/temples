import { useState, useEffect } from 'react'
import { findBestMatch } from '../utils/stringMatch'
import { getTemples2FileName } from '../utils/stateFileMapping'

export function useStateTemples2(stateName) {
  const [temples, setTemples] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let isMounted = true

    async function loadStateTemples() {
      try {
        if (!stateName) {
          setTemples([])
          setStatus('ready')
          return
        }

        // Get the correct file name for temples2
        const fileName = getTemples2FileName(stateName)
        if (!fileName) {
          console.error(`No file mapping found for state: ${stateName}`)
          if (isMounted) {
            setStatus('error')
          }
          return
        }

        // Load new temples2 data
        const temples2Response = await fetch(
          `${import.meta.env.BASE_URL}data/temples2/${encodeURIComponent(
            fileName
          )}.json`
        )

        if (!temples2Response.ok) {
          console.error(`Failed to load temples2 for ${stateName}`)
          if (isMounted) {
            setStatus('error')
          }
          return
        }

        const temples2Data = await temples2Response.json()

        // Load old data for merging year_constructed and festivals
        const oldResponse = await fetch(
          `${import.meta.env.BASE_URL}data/temples/${encodeURIComponent(
            stateName
          )}.json`
        )

        let oldTemplesByCity = {}
        if (oldResponse.ok) {
          const oldData = await oldResponse.json()
          oldTemplesByCity = oldData.cities || {}
        }

        // Merge data
        const mergedTemples = []

        temples2Data.forEach((townData) => {
          const oldCityTemples = oldTemplesByCity[townData.town] || []
          const oldTempleNames = oldCityTemples.map((t) => t.name)

          townData.top_temples.forEach((temple) => {
            // Try to find matching temple in old data
            let matchedOldTemple = null

            if (oldTempleNames.length > 0) {
              const bestMatch = findBestMatch(temple.name, oldTempleNames)
              if (bestMatch) {
                matchedOldTemple = oldCityTemples.find(
                  (t) => t.name === bestMatch
                )
              }
            }

            mergedTemples.push({
              // New data
              name: temple.name,
              deity: temple.deity,
              location_note: temple.location_note,
              state: townData.state,
              town: townData.town,
              type: townData.type,
              lat: townData.lat,
              lon: townData.lon,
              // Old data (if matched)
              year_constructed: matchedOldTemple?.year_constructed || null,
              festivals_and_events:
                matchedOldTemple?.festivals_and_events || [],
            })
          })
        })

        if (isMounted) {
          setTemples(mergedTemples)
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
  }, [stateName])

  return { temples, status }
}
