import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail, Share2, MessageCircle, Search, BarChart3, ShoppingBag,
  Play, Pause, Trash2, ChevronRight, Clock
} from 'lucide-react'
import { Agent, AgentType, AGENT_TYPE_LABELS } from '../../types/agent'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useAgentStore } from '../../store'

const agentIcons: Record<AgentType, React.ReactNode> = {
  email: <Mail size={20} />,
  social_media: <Share2 size={20} />,
  whatsapp: <MessageCircle size={20} />,
  seo: <Search size={20} />,
  sales_analytics: <BarChart3 size={20} />,
  ecommerce: <ShoppingBag size={20} />
}

const agentColorMap: Record<AgentType, { bg: string; text: string; border: string; badge: 'info' | 'purple' | 'success' | 'orange' | 'error' | 'teal' }> = {
  email: { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-800/50', badge: 'info' },
  social_media: { bg: 'bg-purple-900/30', text: 'text-purple-400', border: 'border-purple-800/50', badge: 'purple' },
  whatsapp: { bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-800/50', badge: 'success' },
  seo: { bg: 'bg-orange-900/30', text: 'text-orange-400', border: 'border-orange-800/50', badge: 'orange' },
  sales_analytics: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-800/50', badge: 'error' },
  ecommerce: { bg: 'bg-teal-900/30', text: 'text-teal-400', border: 'border-teal-800/50', badge: 'teal' }
}

const statusVariant = (status: Agent['status']): 'success' | 'warning' | 'error' | 'default' => {
  if (status === 'active') return 'success'
  if (status === 'running') return 'warning'
  if (status === 'error') return 'error'
  return 'default'
}

interface AgentCardProps {
  agent: Agent
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const navigate = useNavigate()
  const { updateAgent, deleteAgent, addLog } = useAgentStore()
  const colors = agentColorMap[agent.type]

  const toggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newStatus = agent.status === 'active' ? 'inactive' : 'active'
    updateAgent(agent.id, { status: newStatus })
    addLog({
      agentId: agent.id,
      level: 'info',
      message: `Agent ${newStatus === 'active' ? 'activated' : 'deactivated'}`
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Delete agent "${agent.name}"?`)) {
      deleteAgent(agent.id)
    }
  }

  return (
    <div
      className={`
        bg-gray-900 border rounded-xl p-5 cursor-pointer group
        hover:border-gray-700 transition-all duration-150
        ${agent.status === 'error' ? 'border-red-800/50' : 'border-gray-800'}
      `}
      onClick={() => navigate(`/agents/${agent.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.border} border`}>
          <span className={colors.text}>{agentIcons[agent.type]}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggleStatus}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title={agent.status === 'active' ? 'Pause' : 'Activate'}
          >
            {agent.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors"
            title="Delete agent"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
            {agent.name}
          </h3>
          <Badge variant={statusVariant(agent.status)} dot>
            {agent.status}
          </Badge>
        </div>
        <Badge variant={colors.badge} className="mb-2">
          {AGENT_TYPE_LABELS[agent.type]}
        </Badge>
        <p className="text-xs text-gray-500 line-clamp-2">{agent.description}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className="text-sm font-bold text-white">{agent.metrics.totalRuns}</div>
          <div className="text-xs text-gray-600">Runs</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-emerald-400">{agent.metrics.successfulRuns}</div>
          <div className="text-xs text-gray-600">Success</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-red-400">{agent.metrics.failedRuns}</div>
          <div className="text-xs text-gray-600">Failed</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Clock size={11} />
          {agent.metrics.lastActivity
            ? new Date(agent.metrics.lastActivity).toLocaleDateString()
            : 'Never run'
          }
        </div>
        <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
      </div>
    </div>
  )
}
