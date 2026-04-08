import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Play, Settings2, Send, CheckCircle, AlertCircle,
  Clock, Zap, Bot, Trash2, RefreshCw
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Input, Select, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { AgentSkillSelector } from '../components/agents/AgentSkillSelector'
import { useAgentStore, useSettingsStore } from '../store'
import { AGENT_TYPE_LABELS } from '../types/agent'
import { runAgent } from '../services/agents'
import { sendDailyReport } from '../services/integrations/telegram'

export const AgentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { agents, updateAgent, deleteAgent, addLog, getAgentLogs } = useAgentStore()
  const { settings } = useSettingsStore()

  const agent = agents.find(a => a.id === id)
  const logs = getAgentLogs(id || '')

  const [task, setTask] = useState('')
  const [context, setContext] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [editForm, setEditForm] = useState({
    name: agent?.name || '',
    description: agent?.description || '',
    systemPrompt: agent?.systemPrompt || '',
    telegramBotToken: agent?.telegramBotToken || '',
    llmProvider: agent?.llmProvider || 'openai',
    llmModel: agent?.llmModel || ''
  })
  const [sendingReport, setSendingReport] = useState(false)

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Bot size={40} className="text-gray-700 mb-3" />
        <p className="text-gray-400">Agent not found</p>
        <Button variant="ghost" className="mt-3" onClick={() => navigate('/agents')}>
          <ArrowLeft size={15} /> Back to Agents
        </Button>
      </div>
    )
  }

  const handleRun = async () => {
    if (!task.trim()) return
    setRunning(true)
    setResult(null)
    addLog({ agentId: agent.id, level: 'info', message: `Running task: ${task.slice(0, 60)}...` })

    try {
      const res = await runAgent({ agent, settings, task, context: context || undefined })
      if (res.success) {
        setResult(res.output || '')
        updateAgent(agent.id, {
          metrics: {
            ...agent.metrics,
            totalRuns: agent.metrics.totalRuns + 1,
            successfulRuns: agent.metrics.successfulRuns + 1,
            lastActivity: new Date().toISOString()
          }
        })
        addLog({ agentId: agent.id, level: 'success', message: 'Task completed successfully' })
      } else {
        setResult(`Error: ${res.error}`)
        updateAgent(agent.id, {
          metrics: {
            ...agent.metrics,
            totalRuns: agent.metrics.totalRuns + 1,
            failedRuns: agent.metrics.failedRuns + 1
          }
        })
        addLog({ agentId: agent.id, level: 'error', message: res.error || 'Task failed' })
      }
    } catch (err) {
      setResult(`Error: ${String(err)}`)
      addLog({ agentId: agent.id, level: 'error', message: String(err) })
    } finally {
      setRunning(false)
    }
  }

  const handleSendReport = async () => {
    const botToken = agent.telegramBotToken || ''
    const chatId = settings.telegram.groupChatId
    if (!botToken || !chatId) {
      addLog({
        agentId: agent.id,
        level: 'warning',
        message: 'Cannot send report: missing bot token or group chat ID'
      })
      return
    }
    setSendingReport(true)
    try {
      const res = await sendDailyReport({
        botToken,
        chatId,
        agentName: agent.name,
        agentType: AGENT_TYPE_LABELS[agent.type],
        activitiesToday: agent.metrics.totalRuns,
        successRate: agent.metrics.totalRuns > 0
          ? Math.round((agent.metrics.successfulRuns / agent.metrics.totalRuns) * 100)
          : 0,
        highlights: logs.slice(0, 5).filter(l => l.level === 'success').map(l => l.message)
      })
      addLog({
        agentId: agent.id,
        level: res.success ? 'success' : 'error',
        message: res.success ? 'Daily report sent to Telegram' : `Report failed: ${res.error}`
      })
    } finally {
      setSendingReport(false)
    }
  }

  const handleSaveSettings = () => {
    updateAgent(agent.id, editForm)
    setShowSettings(false)
    addLog({ agentId: agent.id, level: 'info', message: 'Agent settings updated' })
  }

  const llmOptions = settings.llmProviders.map(p => ({ value: p.name, label: p.label }))

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/agents')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Agents
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSendReport} loading={sendingReport} icon={<Send size={14} />}>
            Send Report
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} icon={<Settings2 size={14} />}>
            Settings
          </Button>
          <Button variant="danger" size="sm" onClick={() => { deleteAgent(agent.id); navigate('/agents') }} icon={<Trash2 size={14} />}>
            Delete
          </Button>
        </div>
      </div>

      {/* Agent info */}
      <div className="flex items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-white">{agent.name}</h2>
            <Badge variant={agent.status === 'active' ? 'success' : agent.status === 'error' ? 'error' : 'default'} dot>
              {agent.status}
            </Badge>
            <Badge variant="info">{AGENT_TYPE_LABELS[agent.type]}</Badge>
          </div>
          <p className="text-sm text-gray-400">{agent.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Run task panel */}
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader title="Run Task" subtitle="Give this agent a task to execute" />
            <div className="space-y-3">
              <Textarea
                label="Task"
                placeholder={`What should the ${AGENT_TYPE_LABELS[agent.type]} agent do?`}
                value={task}
                onChange={e => setTask(e.target.value)}
                rows={3}
              />
              <Textarea
                label="Context (optional)"
                placeholder="Provide additional context, data, or instructions..."
                value={context}
                onChange={e => setContext(e.target.value)}
                rows={2}
              />
              <Button
                onClick={handleRun}
                loading={running}
                disabled={!task.trim()}
                icon={<Play size={14} />}
              >
                {running ? 'Running...' : 'Run Agent'}
              </Button>
            </div>

            {result !== null && (
              <div className="mt-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  {result.startsWith('Error:') ? (
                    <AlertCircle size={14} className="text-red-400" />
                  ) : (
                    <CheckCircle size={14} className="text-emerald-400" />
                  )}
                  <span className="text-xs font-medium text-gray-400">Result</span>
                </div>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {result}
                </pre>
              </div>
            )}
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader title="Skills" subtitle="Capabilities assigned to this agent" />
            <div className="flex flex-wrap gap-2">
              {agent.skills.map(skill => (
                <Badge key={skill.id} variant="info">{skill.name}</Badge>
              ))}
              {agent.skills.length === 0 && (
                <p className="text-xs text-gray-600">No skills assigned. Edit settings to add skills.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Stats & Logs */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Statistics" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Total Runs</span>
                <span className="text-xs font-bold text-white">{agent.metrics.totalRuns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Successful</span>
                <span className="text-xs font-bold text-emerald-400">{agent.metrics.successfulRuns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Failed</span>
                <span className="text-xs font-bold text-red-400">{agent.metrics.failedRuns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Success Rate</span>
                <span className="text-xs font-bold text-white">
                  {agent.metrics.totalRuns > 0
                    ? `${Math.round((agent.metrics.successfulRuns / agent.metrics.totalRuns) * 100)}%`
                    : '—'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Last Activity</span>
                <span className="text-xs text-gray-400">
                  {agent.metrics.lastActivity
                    ? new Date(agent.metrics.lastActivity).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">LLM Provider</span>
                <span className="text-xs text-brand-400">{agent.llmProvider}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Activity Log"
              action={
                <button className="text-xs text-gray-500 hover:text-gray-400">
                  <RefreshCw size={12} />
                </button>
              }
            />
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-4">No activity yet</p>
              ) : (
                logs.slice(0, 20).map(log => (
                  <div key={log.id} className="text-xs">
                    <div className="flex items-center gap-1.5">
                      {log.level === 'success' ? (
                        <CheckCircle size={11} className="text-emerald-400 flex-shrink-0" />
                      ) : log.level === 'error' ? (
                        <AlertCircle size={11} className="text-red-400 flex-shrink-0" />
                      ) : (
                        <Clock size={11} className="text-gray-600 flex-shrink-0" />
                      )}
                      <span className="text-gray-400 truncate">{log.message}</span>
                    </div>
                    <div className="text-gray-700 ml-4">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Settings Modal */}
      <Modal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        title="Agent Settings"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Agent Name"
            value={editForm.name}
            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
          />
          <Textarea
            label="Description"
            value={editForm.description}
            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
          />
          <Select
            label="LLM Provider"
            value={editForm.llmProvider}
            onChange={e => setEditForm(f => ({ ...f, llmProvider: e.target.value }))}
            options={llmOptions}
          />
          <Input
            label="Model Override"
            value={editForm.llmModel}
            onChange={e => setEditForm(f => ({ ...f, llmModel: e.target.value }))}
            placeholder="Leave blank for provider default"
          />
          <Input
            label="Telegram Bot Token"
            type="password"
            value={editForm.telegramBotToken}
            onChange={e => setEditForm(f => ({ ...f, telegramBotToken: e.target.value }))}
            placeholder="123456789:AABBCCdd..."
          />
          <Textarea
            label="System Prompt"
            value={editForm.systemPrompt}
            onChange={e => setEditForm(f => ({ ...f, systemPrompt: e.target.value }))}
            rows={4}
            placeholder="Custom system instructions for this agent..."
          />
          <div className="border-t border-gray-800 pt-4">
            <p className="text-xs font-medium text-gray-400 mb-3">Skills</p>
            <AgentSkillSelector
              agentType={agent.type}
              selectedSkills={agent.skills}
              onChange={skills => updateAgent(agent.id, { skills })}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
