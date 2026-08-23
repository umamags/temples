import { useMemo, useState } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { useIndiaAtlas } from '../data/useIndiaAtlas'
import { useVisitedTemples } from '../hooks/useVisitedTemples'

const WIDTH = 600
const PADDING = 16

export default function StatePinMap({
  stateName,
  towns,
  onPinClick,
  height = 400,
}) {
  const { status, featureCollection } = useIndiaAtlas()
  const { visitedTemples } = useVisitedTemples()
  const [hoveredTown, setHoveredTown] = useState(null)

  const stateFeature = useMemo(() => {
    if (!featureCollection) return null
    return featureCollection.features.find((f) => f.properties?.name === stateName)
  }, [featureCollection, stateName])

  const { path, projection } = useMemo(() => {
    if (!stateFeature || !featureCollection) return { path: null, projection: null }
    const proj = geoMercator().fitExtent(
      [
        [PADDING, PADDING],
        [WIDTH - PADDING, height - PADDING],
      ],
      featureCollection
    )
    return { path: geoPath(proj), projection: proj }
  }, [stateFeature, featureCollection, height])

  // Get unique towns for pins - MUST be called before early returns
  const uniqueTowns = useMemo(() => {
    const townMap = new Map()
    towns.forEach((town) => {
      const key = `${town.town}-${town.type}`
      if (!townMap.has(key)) {
        townMap.set(key, {
          town: town.town,
          type: town.type,
          lat: town.lat,
          lon: town.lon,
        })
      }
    })
    return Array.from(townMap.values())
  }, [towns])

  const isVisitedTown = (townName) => {
    return Array.from(visitedTemples).some((key) => {
      const parts = key.split('-')
      if (parts.length < 2) return false
      const cityName = parts.slice(1).join('-')
      return cityName === townName || cityName.includes(townName)
    })
  }

  const getColorForType = (type, townName) => {
    if (isVisitedTown(townName)) {
      return '#ff0000'
    }
    switch (type) {
      case 'city':
        return '#000000'
      case 'town':
        return '#ff0000'
      case 'temple town':
        return '#0066ff'
      default:
        return '#666666'
    }
  }

  // NOW we can do early returns, after all hooks have been called
  if (status === 'loading') return <p className="map-status">Loading map…</p>
  if (status === 'error') return <p className="map-status">Map not available.</p>
  if (!featureCollection || !path || !projection) return <p className="map-status">Map data unavailable.</p>

  return (
    <svg
      className="state-pin-map"
      viewBox={`0 0 ${WIDTH} ${height}`}
      role="img"
      aria-label={`Map of ${stateName} with temple towns`}
    >
      <defs>
        <style>{`
          .state-path { stroke: #999; stroke-width: 0.8; }
          .state-path-selected { fill: #d4e6f1 !important; opacity: 0.7 !important; }
          .state-path-context { fill: #e8e8e8; opacity: 0.3 !important; }
          .pin { cursor: pointer; transition: r 0.2s ease, filter 0.2s ease; }
          .pin:hover { r: 5; filter: drop-shadow(0 0 3px rgba(0,0,0,0.4)); }
          .pin-tooltip { font-size: 11px; font-family: Arial, sans-serif; pointer-events: none; }
        `}</style>
      </defs>

      {/* Render all states: selected state highlighted, others grayed out */}
      {featureCollection.features.map((feature) => {
        const isSelectedState = feature.properties?.name === stateName
        const className = isSelectedState
          ? 'state-path state-path-selected'
          : 'state-path state-path-context'

        return (
          <path
            key={feature.properties?.name}
            d={path(feature)}
            className={className}
            fill={isSelectedState ? '#d4e6f1' : '#e8e8e8'}
            stroke="#999"
            strokeWidth="0.5"
          />
        )
      })}

      {/* Render town pins with color-coding */}
      {projection &&
        uniqueTowns.map((town) => {
          const [x, y] = projection([town.lon, town.lat])
          const color = getColorForType(town.type, town.town)
          const isHovered = hoveredTown === `${town.town}-${town.type}`

          return (
            <g
              key={`${town.town}-${town.type}`}
              onMouseEnter={() => setHoveredTown(`${town.town}-${town.type}`)}
              onMouseLeave={() => setHoveredTown(null)}
              onClick={() => onPinClick && onPinClick(town)}
            >
              {/* Pin circle */}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 5 : 3.5}
                fill={color}
                className="pin"
                opacity={0.8}
              />

              {/* Pin label on hover */}
              {isHovered && (
                <g>
                  {/* Background rect for readability */}
                  <rect
                    x={x - 35}
                    y={y - 18}
                    width="70"
                    height="16"
                    fill="white"
                    stroke={color}
                    strokeWidth="0.5"
                    rx="2"
                    opacity="0.95"
                  />
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    className="pin-tooltip"
                    fill="#000"
                  >
                    {town.town}
                  </text>
                </g>
              )}

              <title>{town.town}</title>
            </g>
          )
        })}

      {/* Legend */}
      <g transform={`translate(${WIDTH - 140}, ${PADDING + 10})`}>
        <text
          x="0"
          y="0"
          fontSize="11"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          fill="#333"
        >
          Legend
        </text>

        {[
          { type: 'city', label: 'City', color: '#000000' },
          { type: 'town', label: 'Town', color: '#ff0000' },
          { type: 'temple town', label: 'Temple Town', color: '#0066ff' },
        ].map((item, idx) => (
          <g key={item.type} transform={`translate(0, ${18 + idx * 16})`}>
            <circle cx="5" cy="0" r="2.5" fill={item.color} opacity="0.8" />
            <text
              x="12"
              y="4"
              fontSize="10"
              fontFamily="Arial, sans-serif"
              fill="#333"
            >
              {item.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}
