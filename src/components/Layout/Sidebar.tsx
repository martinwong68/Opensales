import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Bot,
  Plug,
  Settings,
  BarChart3,
  Zap,
  ChevronRight
} from 'lucide-react'
import { useAgentStore } from '../../store'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/agents', label: 'Agents', icon: Bot },
  { path: '/integrations', label: 'Integrations', icon: Plug },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings }
]

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const agents = useAgentStore(s => s.agents)
  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'running').length

  return (
    <aside className="w-60 h-full bg-gray-950 border-r border-gray-800 flex flex-col select-none">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Opensales</div>
            <div className="text-xs text-gray-500">AI Marketing Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-150 group
                ${isActive
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }
              `}
            >
              <Icon size={17} className={isActive ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="text-brand-500" />}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom status */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="bg-gray-900 rounded-xl px-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">Active Agents</span>
            <span className={`text-xs font-bold ${activeAgents > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
              {activeAgents}/{agents.length}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: agents.length > 0 ? `${(activeAgents / agents.length) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {agents.length === 0 ? 'No agents configured' : `${activeAgents} running`}
          </p>
        </div>
      </div>
    </aside>
  )
}
