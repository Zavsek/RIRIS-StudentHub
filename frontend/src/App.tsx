import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { CatalogPage } from './pages/CatalogPage'
import { CoursePage } from './pages/CoursePage'
import { CalendarPage } from './pages/CalendarPage'
import { SchedulePage } from './pages/SchedulePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
