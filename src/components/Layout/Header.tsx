import React from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Moon, Sun } from 'lucide-react'
import { useSettingsStore } from '../../store'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of all agent activities' },
  '/agents': { title: 'AI Agents', subtitle: 'Manage your marketing agents' },
  '/integrations': { title: 'Integrations', subtitle: 'Connect your tools and services' },
  '/reports': { title: 'Reports', subtitle: 'Analytics and performance metrics' },
  '/settings': { title: 'Settings', subtitle: 'Configure your preferences' }
}

export const Header: React.FC = () => {
  const location = useLocation()
  const { settings, updateSettings } = useSettingsStore()

  const currentPage = Object.entries(pageTitles).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )
  const { title, subtitle } = currentPage?.[1] ?? { title: 'Opensales', subtitle: '' }

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark'
    updateSettings({ theme: newTheme })
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <header className="h-14 border-b border-gray-800 bg-gray-950/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div>
        <h1 className="text-sm font-semibold text-white">{title}</h1>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title="Toggle theme"
        >
          {settings.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors relative"
          title="Notifications"
        >
          <Bell size={16} />
        </button>
        <div className="w-px h-5 bg-gray-800 mx-1" />
        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
          OS
        </div>
      </div>
    </header>
  )
}
