import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../../config/apiConfig'

export default function ApisTester() {
  const [apis, setApis] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedApi, setSelectedApi] = useState(null)
  const [params, setParams] = useState({})
  const [response, setResponse] = useState(null)
  const [executing, setExecuting] = useState(false)

  useEffect(() => {
    analyzeApis()
  }, [])

  const analyzeApis = async () => {
    try {
      setLoading(true)
      setError(null)
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/backend/admin/analyzeApis.php`)
      const data = await response.json()

      if (data.success) {
        setApis(data.apis || [])
      } else {
        setError('Failed to analyze APIs')
      }
    } catch (err) {
      console.error('Error analyzing APIs:', err)
      setError('Failed to analyze APIs')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectApi = (api) => {
    setSelectedApi(api)
    setParams({})
    setResponse(null)
    // Initialize params with empty values
    const initialParams = {}
    Object.keys(api.params).forEach(key => {
      initialParams[key] = ''
    })
    setParams(initialParams)
  }

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const handleExecute = async () => {
    if (!selectedApi) return

    setExecuting(true)
    setError(null)

    try {
      const baseUrl = getApiBaseUrl()
      let url = `${baseUrl}/backend/${selectedApi.path}.php`

      // Build query string or body based on method
      if (selectedApi.method === 'GET') {
        const queryParams = new URLSearchParams()
        Object.keys(params).forEach(key => {
          if (params[key]) {
            queryParams.append(key, params[key])
          }
        })
        if (queryParams.toString()) {
          url += '?' + queryParams.toString()
        }

        const res = await fetch(url)
        const data = await res.json()
        setResponse(data)
      } else {
        const res = await fetch(url, {
          method: selectedApi.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        })
        const data = await res.json()
        setResponse(data)
      }
    } catch (err) {
      console.error('Error executing API:', err)
      setError('Failed to execute API')
      setResponse(null)
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: '#f0f4f8',
      borderRadius: '8px',
      border: '1px solid #ddd'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: 0, fontSize: '1.3rem', color: '#2c5aa0' }}>
          🔌 APIs
        </h2>
        <button
          onClick={analyzeApis}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2c5aa0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem'
          }}
        >
          {loading ? 'Analyzing...' : 'Reanalyze APIs'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#ffebee',
          border: '1px solid #c62828',
          borderRadius: '4px',
          marginBottom: '1rem',
          color: '#c62828'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* APIs List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #ddd',
          padding: '1rem',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          <h4 style={{ marginTop: 0 }}>Available APIs ({apis.length})</h4>
          {apis.map((api, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectApi(api)}
              style={{
                padding: '0.75rem',
                marginBottom: '0.5rem',
                backgroundColor: selectedApi?.path === api.path ? '#e3f2fd' : '#f9f9f9',
                border: selectedApi?.path === api.path ? '2px solid #2c5aa0' : '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#2c5aa0' }}>
                {api.method} /{api.path}
              </div>
              {api.description && (
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                  {api.description}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* API Tester */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #ddd',
          padding: '1rem'
        }}>
          {selectedApi ? (
            <>
              <h4 style={{ marginTop: 0 }}>
                {selectedApi.method} /{selectedApi.path}
              </h4>

              {Object.keys(selectedApi.params).length > 0 ? (
                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{ marginBottom: '0.5rem' }}>Parameters</h5>
                  {Object.entries(selectedApi.params).map(([key, info]) => (
                    <div key={key} style={{ marginBottom: '0.75rem' }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        {key} {info.required ? <span style={{ color: 'red' }}>*</span> : '(optional)'}
                      </label>
                      <input
                        type={info.type === 'number' ? 'number' : 'text'}
                        value={params[key] || ''}
                        onChange={(e) => handleParamChange(key, e.target.value)}
                        placeholder={info.type === 'number' ? '0' : 'value'}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>No parameters required</p>
              )}

              <button
                onClick={handleExecute}
                disabled={executing}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#2e7d32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: executing ? 'not-allowed' : 'pointer',
                  opacity: executing ? 0.6 : 1,
                  marginBottom: '1rem'
                }}
              >
                {executing ? 'Executing...' : 'Execute'}
              </button>

              {response && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: response.success ? '#d4edda' : '#ffebee',
                  border: `1px solid ${response.success ? '#2e7d32' : '#c62828'}`,
                  borderRadius: '4px',
                  color: response.success ? '#2e7d32' : '#c62828',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  <h5 style={{ marginTop: 0 }}>Response</h5>
                  <pre style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace'
                  }}>
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#666', textAlign: 'center', paddingTop: '2rem' }}>
              Select an API to test
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
