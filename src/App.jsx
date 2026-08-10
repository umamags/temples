import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import StateDetailPage from './pages/StateDetailPage'
import StateTownDetailPage from './pages/StateTownDetailPage'
import TempleListPage from './pages/TempleListPage'
import TempleDetailPage from './pages/TempleDetailPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter basename="/temples/">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="state/:stateName" element={<StateDetailPage />} />
          <Route path="state/:stateName/:townName" element={<StateTownDetailPage />} />
          <Route path="temple/:stateName" element={<TempleListPage />} />
          <Route path="temple/:stateName/:cityName/:templeName" element={<TempleDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
