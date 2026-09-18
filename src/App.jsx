import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import StateDetailPage from './pages/StateDetailPage'
import StateTownDetailPage from './pages/StateTownDetailPage'
import TempleListPage from './pages/TempleListPage'
import TempleDetailPage from './pages/TempleDetailPage'
import SearchResultsPage from './pages/SearchResultsPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLocationsPage from './pages/admin/AdminLocationsPage'
import AdminLocationsAddPage from './pages/admin/AdminLocationsAddPage'
import AdminLocationsEditPage from './pages/admin/AdminLocationsEditPage'
import AdminTemplesPage from './pages/admin/AdminTemplesPage'
import AdminTemplesAddPage from './pages/admin/AdminTemplesAddPage'
import AdminTemplesEditPage from './pages/admin/AdminTemplesEditPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter basename="/temples/">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="state/:stateId" element={<StateDetailPage />} />
          <Route path="city/:cityId" element={<StateTownDetailPage />} />
          <Route path="temple/:templeId" element={<TempleDetailPage />} />
          <Route path="search" element={<SearchResultsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/locations" element={<AdminLocationsPage />} />
        <Route path="admin/locations/add" element={<AdminLocationsAddPage />} />
        <Route path="admin/locations/:locationId/edit" element={<AdminLocationsEditPage />} />
        <Route path="admin/temples" element={<AdminTemplesPage />} />
        <Route path="admin/temples/add" element={<AdminTemplesAddPage />} />
        <Route path="admin/temples/:templeId/edit" element={<AdminTemplesEditPage />} />
      </Routes>
    </BrowserRouter>
  )
}
