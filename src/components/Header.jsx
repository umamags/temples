import { useUsername } from '../hooks/useUsername'

export default function Header() {
  const { username, setUsername } = useUsername()

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
  }

  return (
    <header style={{
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6',
      padding: '1rem 1.5rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <label htmlFor="username-input" style={{
          fontSize: '1.1rem',
          fontWeight: '500',
          color: '#333',
        }}>
          Welcome
        </label>
        <input
          id="username-input"
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Guest"
          style={{
            padding: '0.5rem 0.75rem',
            fontSize: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            minWidth: '200px',
          }}
        />
      </div>
    </header>
  )
}
