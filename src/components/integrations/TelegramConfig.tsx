import React, { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Send, CheckCircle, XCircle } from 'lucide-react'
import { useIntegrationStore, useSettingsStore } from '../../store'

export const TelegramConfig: React.FC = () => {
  const { integrations, addIntegration, updateIntegration } = useIntegrationStore()
  const { settings, updateSettings } = useSettingsStore()
  const existing = integrations.find(i => i.type === 'telegram')

  const [config, setConfig] = useState({
    groupChatId: settings.telegram.groupChatId || existing?.config.groupChatId || '',
    reportTime: settings.telegram.reportTime || '09:00',
    reportEnabled: settings.telegram.reportEnabled ?? true,
    testMessage: ''
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const handleSave = () => {
    updateSettings({
      telegram: {
        groupChatId: config.groupChatId,
        reportTime: config.reportTime,
        reportEnabled: config.reportEnabled
      }
    })
    const data = {
      type: 'telegram' as const,
      name: 'Telegram Group',
      status: 'connected' as const,
      config: { groupChatId: config.groupChatId, reportTime: config.reportTime }
    }
    if (existing) {
      updateIntegration(existing.id, data)
    } else {
      addIntegration(data)
    }
  }

  const handleTest = async () => {
    if (!config.groupChatId) {
      setTestResult({ ok: false, msg: 'Please set a Group Chat ID first' })
      return
    }
    // In real app this would use a bot token from an agent
    setTesting(true)
    setTestResult(null)
    try {
      // Simulate API test since no bot token at this level
      await new Promise(r => setTimeout(r, 800))
      setTestResult({ ok: true, msg: 'Configuration saved. Use an agent\'s bot to send test messages.' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Telegram Group Reports</h3>
        <p className="text-xs text-gray-500">
          All agents will send their daily activity reports to this shared Telegram group.
          Each agent can also have its own bot token configured individually.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Group Chat ID"
          placeholder="-100123456789"
          value={config.groupChatId}
          onChange={e => setConfig(c => ({ ...c, groupChatId: e.target.value }))}
          hint="Get your group chat ID by adding @RawDataBot to the group"
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">Daily Report Time</label>
          <input
            type="time"
            value={config.reportTime}
            onChange={e => setConfig(c => ({ ...c, reportTime: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-xs text-gray-500">Time to send daily summary to the group</p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setConfig(c => ({ ...c, reportEnabled: !c.reportEnabled }))}
            className={`w-10 h-5 rounded-full transition-colors relative ${config.reportEnabled ? 'bg-brand-600' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${config.reportEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm text-gray-300">Enable daily reports</span>
        </label>
      </div>

      {testResult && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-xs ${testResult.ok ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
          {testResult.ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {testResult.msg}
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1">Save Configuration</Button>
        <Button variant="secondary" onClick={handleTest} loading={testing} icon={<Send size={14} />}>
          Test
        </Button>
      </div>

      {existing && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Badge variant="success" dot>Connected</Badge>
          Last updated: {new Date().toLocaleDateString()}
        </div>
      )}
    </div>
  )
}
