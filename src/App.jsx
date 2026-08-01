import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import StateCityDetailPage from './pages/StateCityDetailPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="state/:stateName/city/:cityName" element={<StateCityDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
