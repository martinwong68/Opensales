import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Layout/Sidebar'
import { Header } from './components/Layout/Header'
import { Dashboard } from './pages/Dashboard'
import { Agents } from './pages/Agents'
import { AgentDetail } from './pages/AgentDetail'
import { Integrations } from './pages/Integrations'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'

const App: React.FC = () => (
  <HashRouter>
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  </HashRouter>
)

export default App
