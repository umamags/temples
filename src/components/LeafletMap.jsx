import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function LeafletMap({ lat, lng, title = 'Location' }) {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (!lat || !lng || !mapContainer.current) return

    // Initialize map
    map.current = L.map(mapContainer.current).setView([lat, lng], 12)

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current)

    // Add marker
    L.marker([lat, lng])
      .addTo(map.current)
      .bindPopup(title)
      .openPopup()

    // Add circle around location (500 meters radius)
    L.circle([lat, lng], {
      color: '#ff0000',
      fillColor: '#ff0000',
      fillOpacity: 0.2,
      weight: 2,
      radius: 500,
    }).addTo(map.current)

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [lat, lng, title])

  if (!lat || !lng) {
    return null
  }

  return (
    <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h2>
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}
      />
    </div>
  )
}
