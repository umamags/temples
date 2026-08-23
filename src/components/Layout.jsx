import { Outlet, Link } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import { useUsername } from '../hooks/useUsername'

export default function Layout() {
  const { username, setUsername } = useUsername()

  return (
    <div className="app">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>🏛️ Temples of India</h1>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1.5rem' }}>
          <label htmlFor="header-username" style={{ fontSize: '1rem', fontWeight: '500' }}>
            Welcome
          </label>
          <input
            id="header-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Guest"
            style={{
              padding: '0.4rem 0.6rem',
              fontSize: '0.95rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '180px',
            }}
          />
        </div>
      </header>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
