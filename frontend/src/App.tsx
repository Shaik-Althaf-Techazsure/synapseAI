import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ToastContainer from './components/Toast'
import { ToastProvider } from './context/ToastContext'
import LandingPage from './pages/LandingPage'
import MeetingPage from './pages/MeetingPage'
import FocusPage from './pages/FocusPage'
import ContextPage from './pages/ContextPage'
import PulsePage from './pages/PulsePage'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar />
        <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main className="main-content" style={{ marginTop: 58 }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/meeting" element={<MeetingPage />} />
              <Route path="/focus" element={<FocusPage />} />
              <Route path="/context" element={<ContextPage />} />
              <Route path="/pulse" element={<PulsePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <ToastContainer />
      </div>
    </ToastProvider>
  )
}
