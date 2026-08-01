import { useState, useEffect } from 'react'
import { feature } from 'topojson-client'

export function useIndiaAtlas() {
  const [status, setStatus] = useState('loading')
  const [featureCollection, setFeatureCollection] = useState(null)
  const [colorByName, setColorByName] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadAtlas() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}maps/states-pilot.json`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const topology = await response.json()

        // Extract admin1 (states/provinces) from the topology
        const states = feature(topology, topology.objects.admin1_10m)

        // Filter to get only India states
        const indiaStates = states.features.filter((f) => f.properties?.admin === 'India')

        if (indiaStates.length === 0) {
          throw new Error('India states not found in map data')
        }

        // Assign colors to states (5 colors alternated)
        const colors = ['#FFB6C1', '#87CEEB', '#98D98E', '#FFD700', '#DDA0DD']
        const stateColorMap = new Map()
        indiaStates.forEach((state, idx) => {
          const stateName = state.properties?.name
          if (stateName) {
            stateColorMap.set(stateName, colors[idx % colors.length])
          }
        })

        if (isMounted) {
          setFeatureCollection({ type: 'FeatureCollection', features: indiaStates })
          setColorByName(stateColorMap)
          setStatus('ready')
        }
      } catch (error) {
        console.error('Failed to load map:', error)
        if (isMounted) {
          setStatus('error')
        }
      }
    }

    loadAtlas()

    return () => {
      isMounted = false
    }
  }, [])

  return { status, featureCollection, colorByName }
}
