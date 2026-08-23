import { useMemo } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { useIndiaAtlas } from '../data/useIndiaAtlas'
import { citiesWithTempleData } from '../data/citiesWithTempleData'
import { useVisitedTemples } from '../hooks/useVisitedTemples'

const WIDTH = 600
const PADDING = 16

export default function IndiaMap({ onCityClick, onStateClick, height = 400 }) {
  const { status, featureCollection, colorByName } = useIndiaAtlas()
  const { visitedTemples } = useVisitedTemples()

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
      onStateClick(stateName)
    }
  }

  const isVisitedCity = (city) => {
    return Array.from(visitedTemples).some((key) => {
      const parts = key.split('-')
      if (parts.length < 2) return false
      const cityName = parts.slice(1).join('-')
      return cityName === city.city || cityName.includes(city.city)
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
        citiesWithTempleData.map((city) => {
          const [x, y] = projection([city.lon, city.lat])
          const dotColor = isVisitedCity(city) ? '#ff0000' : '#1a1a1a'
          return (
            <g
              key={`${city.state}-${city.city}`}
              onClick={() => onCityClick && onCityClick(city.state, city.city)}
            >
              <circle cx={x} cy={y} r={2.5} fill={dotColor} className="city-dot" />
              <title>{city.city}</title>
            </g>
          )
        })}
    </svg>
  )
}
