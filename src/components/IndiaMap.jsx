import { useMemo } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { useIndiaAtlas } from '../data/useIndiaAtlas'
import { useVisitedTemples } from '../hooks/useVisitedTemples'

const WIDTH = 600
const PADDING = 16

export default function IndiaMap({ locations = [], states = [], onCityClick, onStateClick, height = 400 }) {
  const { status, featureCollection, colorByName } = useIndiaAtlas()
  const { visitedTemples } = useVisitedTemples()

  // Create maps for faster lookup
  const locationMap = useMemo(() => {
    const map = new Map()
    locations.forEach(loc => {
      map.set(loc.name, loc)
    })
    return map
  }, [locations])

  const stateMap = useMemo(() => {
    const map = new Map()
    states.forEach(state => {
      map.set(state.name, state)
    })
    return map
  }, [states])

  const { path, projection } = useMemo(() => {
    if (!featureCollection) return { path: null, projection: null }

    // Fit projection to all states (full India map)
    const projection = geoMercator().fitExtent(
      [
        [PADDING, PADDING],
        [WIDTH - PADDING, height - PADDING],
      ],
      featureCollection
    )

    return { path: geoPath(projection), projection }
  }, [featureCollection, height])

  const handleStateClick = (stateName) => {
    if (onStateClick) {
      const state = stateMap.get(stateName)
      if (state) {
        onStateClick(state.id)
      }
    }
  }

  const handleCityClick = (cityName, stateName) => {
    if (onCityClick) {
      const location = locationMap.get(cityName)
      if (location) {
        onCityClick(location.id)
      }
    }
  }

  const isVisitedLocation = (location) => {
    return Array.from(visitedTemples).some((key) => {
      const parts = key.split('-')
      if (parts.length < 2) return false
      const cityName = parts.slice(1).join('-')
      return cityName === location.name || cityName.includes(location.name)
    })
  }

  if (status === 'loading') return <p className="map-status">Loading map…</p>
  if (status === 'error') return <p className="map-status">Map not available.</p>
  if (!featureCollection) return <p className="map-status">No map available.</p>

  return (
    <svg
      className="india-map"
      viewBox={`0 0 ${WIDTH} ${height}`}
      role="img"
      aria-label="Map of India with temple cities"
    >
      <defs>
        <style>{`
          .state-path { stroke: #333; stroke-width: 0.8; cursor: pointer; transition: opacity 0.2s ease; }
          .state-path:hover { opacity: 0.9 !important; }
          .city-dot { cursor: pointer; transition: r 0.2s ease, fill 0.2s ease; }
          .city-dot:hover { r: 4; filter: drop-shadow(0 0 3px rgba(0,0,0,0.3)); }
        `}</style>
      </defs>

      {/* Render all states (colored if they have temple data, light gray otherwise) */}
      {featureCollection.features.map((feature) => {
        const stateName = feature.properties?.name
        const hasTempleData = colorByName?.has(stateName)
        const color = hasTempleData ? colorByName.get(stateName) : '#e8e8e8'
        const opacity = hasTempleData ? 0.85 : 0.6

        return (
          <g
            key={stateName}
            onClick={() => handleStateClick(stateName)}
            style={{ cursor: 'pointer' }}
          >
            <path
              d={path(feature)}
              className="state-path"
              fill={color}
              stroke="#999"
              strokeWidth="0.5"
              opacity={opacity}
            />
            <title>{stateName}</title>
          </g>
        )
      })}

      {/* Render city points as small dots with tooltips (only cities with temple data) */}
      {projection &&
        locations.map((location) => {
          if (!location.lat || !location.lon) return null

          const [x, y] = projection([location.lon, location.lat])
          const dotColor = isVisitedLocation(location) ? '#ff0000' : '#1a1a1a'

          return (
            <g
              key={`${location.state}-${location.id}`}
              onClick={() => handleCityClick(location.name, location.state)}
            >
              <circle cx={x} cy={y} r={2.5} fill={dotColor} className="city-dot" />
              <title>{location.name}, {location.state}</title>
            </g>
          )
        })}
    </svg>
  )
}
