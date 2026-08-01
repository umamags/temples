import { useMemo } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { useIndiaAtlas } from '../data/useIndiaAtlas'
import { statesAndCities } from '../data/statesData'

const WIDTH = 600
const PADDING = 16
const PIN_PADDING = 40

export default function IndiaMap({ onCityClick, height = 400 }) {
  const { status, featureCollection, colorByName } = useIndiaAtlas()

  const { path, projection } = useMemo(() => {
    if (!featureCollection) return { path: null, projection: null }

    // Create pins collection from all cities for fitting
    const pins = []
    statesAndCities.forEach((state) => {
      state.cities.forEach((city) => {
        pins.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [city.lon, city.lat] } })
      })
    })

    const pinCollection = {
      type: 'FeatureCollection',
      features: pins,
    }

    const projection = geoMercator().fitExtent(
      [
        [PIN_PADDING, PIN_PADDING],
        [WIDTH - PIN_PADDING, height - PIN_PADDING],
      ],
      pinCollection
    )

    return { path: geoPath(projection), projection }
  }, [featureCollection, height])

  if (status === 'loading') return <p className="map-status">Loading map…</p>
  if (status === 'error') return <p className="map-status">Map not available.</p>
  if (!featureCollection) return <p className="map-status">No map available.</p>

  const allCities = []
  statesAndCities.forEach((state) => {
    state.cities.forEach((city) => {
      allCities.push({
        ...city,
        state: state.state,
      })
    })
  })

  return (
    <svg
      className="india-map"
      viewBox={`0 0 ${WIDTH} ${height}`}
      role="img"
      aria-label="Map of India with states and cities"
    >
      <defs>
        <style>{`
          .state-path { stroke: #333; stroke-width: 0.5; cursor: pointer; }
          .state-path:hover { opacity: 0.8; }
          .city-dot { cursor: pointer; }
          .city-tooltip { font-size: 11px; pointer-events: none; }
        `}</style>
      </defs>

      {/* Render colored states */}
      {featureCollection.features.map((feature) => {
        const stateName = feature.properties?.name
        const color = colorByName?.get(stateName) || '#e8f4f8'
        return (
          <path
            key={stateName}
            d={path(feature)}
            className="state-path"
            fill={color}
            stroke="#333"
            strokeWidth="0.5"
          >
            <title>{stateName}</title>
          </path>
        )
      })}

      {/* Render city points as small dots with tooltips */}
      {projection &&
        allCities.map((city) => {
          const [x, y] = projection([city.lon, city.lat])
          return (
            <g key={`${city.state}-${city.name}`} onClick={() => onCityClick && onCityClick(city.state, city.name)}>
              <circle cx={x} cy={y} r={2.5} fill="#333" className="city-dot" />
              <title>{city.name}</title>
            </g>
          )
        })}
    </svg>
  )
}
