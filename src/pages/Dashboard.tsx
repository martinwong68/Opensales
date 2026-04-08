import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bot, Activity, TrendingUp, Zap, CheckCircle, AlertCircle,
  Mail, Share2, MessageCircle, Search, BarChart3, ShoppingBag, Plus
} from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useAgentStore } from '../store'
import { AgentType } from '../types/agent'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const agentIcons: Record<AgentType, React.ReactNode> = {
  email: <Mail size={16} />,
  social_media: <Share2 size={16} />,
  whatsapp: <MessageCircle size={16} />,
  seo: <Search size={16} />,
  sales_analytics: <BarChart3 size={16} />,
  ecommerce: <ShoppingBag size={16} />
}

// Generate mock activity data for the chart
const generateActivityData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map(day => ({
    day,
    runs: Math.floor(Math.random() * 50) + 10,
    success: Math.floor(Math.random() * 40) + 8
  }))
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { agents, logs } = useAgentStore()
  const activityData = useMemo(() => generateActivityData(), [])

  const stats = useMemo(() => {
    const active = agents.filter(a => a.status === 'active' || a.status === 'running').length
    const totalRuns = agents.reduce((sum, a) => sum + a.metrics.totalRuns, 0)
    const successRuns = agents.reduce((sum, a) => sum + a.metrics.successfulRuns, 0)
    const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0
    return { total: agents.length, active, totalRuns, successRate }
  }, [agents])

  const recentLogs = logs.slice(0, 8)

  const statCards = [
    { label: 'Total Agents', value: stats.total, icon: <Bot size={20} />, color: 'text-brand-400', bg: 'bg-brand-900/20' },
    { label: 'Active Now', value: stats.active, icon: <Zap size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
    { label: 'Total Runs', value: stats.totalRuns, icon: <Activity size={20} />, color: 'text-blue-400', bg: 'bg-blue-900/20' },
    { label: 'Success Rate', value: `${stats.successRate}%`, icon: <TrendingUp size={20} />, color: 'text-purple-400', bg: 'bg-purple-900/20' }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map(card => (
          <Card key={card.label}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <span className={card.color}>{card.icon}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{card.value}</div>
                <div className="text-xs text-gray-500">{card.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Activity chart */}
        <div className="col-span-2">
          <Card>
            <CardHeader title="Agent Activity (Last 7 Days)" subtitle="Runs and success rates" />
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5b6df7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5b6df7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: 8 }}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Area type="monotone" dataKey="runs" stroke="#5b6df7" fill="url(#runsGrad)" strokeWidth={2} name="Runs" />
                  <Area type="monotone" dataKey="success" stroke="#34d399" fill="url(#successGrad)" strokeWidth={2} name="Success" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Agent status */}
        <Card>
          <CardHeader
            title="Agent Status"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/agents')} icon={<Plus size={13} />}>
                New
              </Button>
            }
          />
          {agents.length === 0 ? (
            <div className="text-center py-6">
              <Bot size={32} className="mx-auto text-gray-700 mb-2" />
              <p className="text-xs text-gray-500">No agents yet</p>
              <Button size="sm" className="mt-3" onClick={() => navigate('/agents')}>
                Create Agent
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {agents.slice(0, 6).map(agent => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  <span className="text-gray-500">{agentIcons[agent.type]}</span>
                  <span className="flex-1 text-xs text-gray-300 truncate">{agent.name}</span>
                  <Badge
                    variant={agent.status === 'active' ? 'success' : agent.status === 'error' ? 'error' : 'default'}
                    dot
                  >
                    {agent.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Activity log */}
      <Card>
        <CardHeader title="Recent Activity" subtitle="Latest agent logs" />
        {recentLogs.length === 0 ? (
          <div className="text-center py-6">
            <Activity size={28} className="mx-auto text-gray-700 mb-2" />
            <p className="text-xs text-gray-500">No activity yet. Create and run agents to see logs here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentLogs.map(log => {
              const agent = agents.find(a => a.id === log.agentId)
              return (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-gray-800/50 last:border-0">
                  {log.level === 'success' ? (
                    <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : log.level === 'error' ? (
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Activity size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-300">
                        {agent?.name || 'Unknown Agent'}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{log.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
