export default function GoogleMapEmbed({ lat, lng, title = 'Location' }) {
  if (!lat || !lng) {
    return null
  }

  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3600!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat}°N+${lng}°E!5e0!3m2!1sen!2sin!4v1234567890`

  return (
    <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h2>
      <iframe
        width="100%"
        height="400"
        style={{ border: 0, borderRadius: '4px' }}
        loading="lazy"
        allowFullScreen=""
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        title={title}
      />
    </div>
  )
}
