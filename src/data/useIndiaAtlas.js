import { useState, useEffect } from 'react'
import { feature } from 'topojson-client'
import stateColorsConfig from '../config/stateColors.json'

export function useIndiaAtlas() {
  const [status, setStatus] = useState('loading')
  const [featureCollection, setFeatureCollection] = useState(null)
  const [colorByName, setColorByName] = useState(null)
  const [statesWithTemples, setStatesWithTemples] = useState(new Set())

  useEffect(() => {
    let isMounted = true

    async function loadAtlas() {
      try {
        // Load state colors config
        const stateColorsMap = new Map(Object.entries(stateColorsConfig.states))

        // Load map topology
        const topoResponse = await fetch(`${import.meta.env.BASE_URL}maps/states-pilot.json`)
        if (!topoResponse.ok) throw new Error(`HTTP ${topoResponse.status}`)

        const topology = await topoResponse.json()

        // Extract admin1 (states/provinces) from the topology
        const states = feature(topology, topology.objects.admin1_10m)

        // Filter to get only India states that have temple data
        const indiaStates = states.features.filter((f) => f.properties?.admin === 'India')

        if (indiaStates.length === 0) {
          throw new Error('India states not found in map data')
        }

        // Only keep states that have colors configured (have temple data)
        const filteredStates = indiaStates.filter((state) => {
          const stateName = state.properties?.name
          return stateColorsMap.has(stateName)
        })

        // Create color map from config
        const colorByNameMap = new Map()
        filteredStates.forEach((state) => {
          const stateName = state.properties?.name
          if (stateName && stateColorsMap.has(stateName)) {
            colorByNameMap.set(stateName, stateColorsMap.get(stateName))
          }
        })

        // Track states with temple data
        setStatesWithTemples(new Set(stateColorsMap.keys()))

        if (isMounted) {
          setFeatureCollection({ type: 'FeatureCollection', features: filteredStates })
          setColorByName(colorByNameMap)
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

  return { status, featureCollection, colorByName, statesWithTemples }
}
