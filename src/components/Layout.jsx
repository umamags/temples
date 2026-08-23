import { Outlet, Link } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'

export default function Layout() {
  return (
    <div className="app">
      <header>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>🏛️ Temples of India</h1>
        </Link>
      </header>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
