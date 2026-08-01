import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="app">
      <header>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>🏛️ Temples of India</h1>
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
