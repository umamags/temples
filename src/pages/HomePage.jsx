import { useNavigate } from 'react-router-dom'
import IndiaMap from '../components/IndiaMap'
import TempleTable from '../components/TempleTable'
import CitySearch from '../components/CitySearch'
import { statesAndCities } from '../data/statesData'
import { useAllTemples } from '../data/useAllTemples'
import { slugify } from '../utils/slug'

export default function HomePage() {
  const navigate = useNavigate()
  const { allTemples, status: templesStatus } = useAllTemples()

  const handleCityClick = (state, city) => {
    const stateSlug = slugify(state)
    const citySlug = slugify(city)
    navigate(`/state/${stateSlug}/town/${citySlug}`)
  }

  const handleStateClick = (state) => {
    const stateSlug = slugify(state)
    navigate(`/state/${stateSlug}`)
  }

  return (
    <div className="page">
      <h1>Explore Temples Across India</h1>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1.5rem' }}>
        Click on any state to see all temples, or click on a city dot to explore temples in that city.
      </p>

      <div className="map-container">
        <IndiaMap onCityClick={handleCityClick} onStateClick={handleStateClick} height={500} />
      </div>

      <CitySearch />

      {templesStatus === 'ready' && allTemples.length > 0 && (
        <section className="detail-section">
          <TempleTable temples={allTemples} title="All Temples Across India" />
        </section>
      )}

      <section className="detail-section">
        <h2>States and Cities</h2>
        <div className="state-city-list">
          {statesAndCities.map((stateData) => (
            <div key={stateData.state} className="state-city-card">
              <h3>{stateData.state}</h3>
              <p>
                <strong>Capital:</strong> {stateData.capital}
              </p>
              <div style={{ marginTop: '0.75rem' }}>
                <strong>Major Cities:</strong>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                  {stateData.cities.map((city) => (
                    <li key={city.name}>
                      <button
                        type="button"
                        onClick={() => handleCityClick(stateData.state, city.name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0066cc',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                        }}
                      >
                        {city.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
