import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useAgentStore } from '../store'
import { AGENT_TYPE_LABELS, AgentType } from '../types/agent'

const AGENT_COLORS: Record<AgentType, string> = {
  email: '#3b82f6',
  social_media: '#a855f7',
  whatsapp: '#10b981',
  seo: '#f97316',
  sales_analytics: '#ef4444',
  ecommerce: '#14b8a6'
}

export const Reports: React.FC = () => {
  const { agents, logs } = useAgentStore()

  const agentPerformance = useMemo(() =>
    agents.map(a => ({
      name: a.name.slice(0, 15),
      runs: a.metrics.totalRuns,
      success: a.metrics.successfulRuns,
      failed: a.metrics.failedRuns,
      type: a.type
    })), [agents])

  const typeDistribution = useMemo(() => {
    const counts = agents.reduce<Record<AgentType, number>>((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1
      return acc
    }, {} as Record<AgentType, number>)
    return Object.entries(counts).map(([type, count]) => ({
      name: AGENT_TYPE_LABELS[type as AgentType],
      value: count,
      color: AGENT_COLORS[type as AgentType]
    }))
  }, [agents])

  const logsByLevel = useMemo(() => {
    const counts = logs.reduce<Record<string, number>>((acc, l) => {
      acc[l.level] = (acc[l.level] || 0) + 1
      return acc
    }, {})
    return [
      { name: 'Success', value: counts.success || 0, color: '#10b981' },
      { name: 'Info', value: counts.info || 0, color: '#3b82f6' },
      { name: 'Warning', value: counts.warning || 0, color: '#f59e0b' },
      { name: 'Error', value: counts.error || 0, color: '#ef4444' }
    ]
  }, [logs])

  const totalRuns = agents.reduce((s, a) => s + a.metrics.totalRuns, 0)
  const totalSuccess = agents.reduce((s, a) => s + a.metrics.successfulRuns, 0)
  const totalFailed = agents.reduce((s, a) => s + a.metrics.failedRuns, 0)
  const overallRate = totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Agents', value: agents.length, variant: 'default' as const },
          { label: 'Total Runs', value: totalRuns, variant: 'info' as const },
          { label: 'Successful', value: totalSuccess, variant: 'success' as const },
          { label: 'Success Rate', value: `${overallRate}%`, variant: totalFailed > 0 ? 'warning' as const : 'success' as const }
        ].map(stat => (
          <Card key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <Badge variant={stat.variant}>{stat.label}</Badge>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Agent performance chart */}
        <Card>
          <CardHeader title="Agent Performance" subtitle="Runs per agent" />
          {agentPerformance.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-600 text-sm">No data yet</div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: 8 }} />
                  <Bar dataKey="success" name="Success" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Type distribution */}
        <Card>
          <CardHeader title="Agent Types" subtitle="Distribution by type" />
          {typeDistribution.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-600 text-sm">No data yet</div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {typeDistribution.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: 8 }} />
                  <Legend formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 11 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Log distribution */}
      <Card>
        <CardHeader title="Activity Log Summary" subtitle="Breakdown by log level" />
        <div className="grid grid-cols-4 gap-4">
          {logsByLevel.map(level => (
            <div key={level.name} className="text-center p-4 rounded-xl" style={{ backgroundColor: `${level.color}15` }}>
              <div className="text-2xl font-bold" style={{ color: level.color }}>{level.value}</div>
              <div className="text-xs mt-1" style={{ color: level.color }}>{level.name}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent logs table */}
      <Card>
        <CardHeader title="Recent Logs" subtitle={`${logs.length} total log entries`} />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Time</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Agent</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Level</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 20).map(log => {
                const agent = agents.find(a => a.id === log.agentId)
                return (
                  <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3 text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2 px-3 text-gray-300">{agent?.name || 'Unknown'}</td>
                    <td className="py-2 px-3">
                      <Badge variant={log.level === 'success' ? 'success' : log.level === 'error' ? 'error' : log.level === 'warning' ? 'warning' : 'default'}>
                        {log.level}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-gray-400 max-w-xs truncate">{log.message}</td>
                  </tr>
                )
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-600">No logs yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
