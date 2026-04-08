import React, { useState } from 'react'
import { Plus, Search, Filter, Bot } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { AgentCard } from '../components/agents/AgentCard'
import { AgentBuilder } from '../components/agents/AgentBuilder'
import { useAgentStore } from '../store'
import { AgentType, AGENT_TYPE_LABELS } from '../types/agent'

const allTypes: Array<AgentType | 'all'> = ['all', 'email', 'social_media', 'whatsapp', 'seo', 'sales_analytics', 'ecommerce']

export const Agents: React.FC = () => {
  const { agents } = useAgentStore()
  const [showBuilder, setShowBuilder] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<AgentType | 'all'>('all')

  const filtered = agents.filter(a => {
    const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || a.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="p-6">
      {/* Header actions */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <Button onClick={() => setShowBuilder(true)} icon={<Plus size={15} />}>
          New Agent
        </Button>
      </div>

      {/* Type filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {allTypes.map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
              ${typeFilter === type
                ? 'bg-brand-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }
            `}
          >
            {type === 'all' ? 'All Agents' : AGENT_TYPE_LABELS[type]}
            {type !== 'all' && (
              <span className="ml-1.5 text-xs opacity-60">
                ({agents.filter(a => a.type === type).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Agents grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Bot size={48} className="text-gray-700 mb-4" />
          {agents.length === 0 ? (
            <>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">No agents yet</h3>
              <p className="text-xs text-gray-600 mb-4">Create your first AI marketing agent to get started</p>
              <Button onClick={() => setShowBuilder(true)} icon={<Plus size={15} />}>
                Create First Agent
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">No agents found</h3>
              <p className="text-xs text-gray-600">Try adjusting your search or filter</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      <AgentBuilder open={showBuilder} onClose={() => setShowBuilder(false)} />
    </div>
  )
}
