export default function TempleJsonDetails({ data }) {
  if (!data) {
    return null
  }

  const formatLabel = (key) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const renderValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return null
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return null
      return (
        <ul style={{ marginLeft: '1.5rem', marginBottom: 0 }}>
          {value.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '0.5rem', color: '#333' }}>
              {typeof item === 'string' ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      )
    }

    if (typeof value === 'object') {
      const nonEmptyEntries = Object.entries(value).filter(
        ([, v]) => v !== null && v !== undefined && v !== ''
      )
      if (nonEmptyEntries.length === 0) return null

      return (
        <div style={{ marginBottom: '1rem' }}>
          {nonEmptyEntries.map(([key, val]) => (
            <div key={key} style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: '#666', fontSize: '0.9rem' }}>
                {formatLabel(key)}:
              </strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#333' }}>
                {typeof val === 'string' ? val : JSON.stringify(val)}
              </p>
            </div>
          ))}
        </div>
      )
    }

    return <p style={{ margin: 0, color: '#333' }}>{String(value)}</p>
  }

  const sections = [
    { key: 'history', label: 'History' },
    { key: 'deities', label: 'Deities' },
    { key: 'festivals', label: 'Festivals' },
    { key: 'visitor_information', label: 'Visitor Information' },
    { key: 'travel', label: 'Travel Information' },
    { key: 'sources', label: 'Sources & References' },
    { key: 'town_description', label: 'About the Town' },
  ]

  return (
    <>
      {sections.map(({ key, label }) => {
        const value = data[key]
        const rendered = renderValue(value)

        if (!rendered) return null

        return (
          <section key={key} style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#1a1a1a' }}>
              {label}
            </h2>
            {key === 'sources' ? (
              <ul style={{ marginLeft: '1.5rem' }}>
                {Array.isArray(value) &&
                  value.map((url, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0066cc', textDecoration: 'none' }}
                      >
                        {url}
                      </a>
                    </li>
                  ))}
              </ul>
            ) : (
              rendered
            )}
          </section>
        )
      })}
    </>
  )
}
