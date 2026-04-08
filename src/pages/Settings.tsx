import React, { useState } from 'react'
import { Eye, EyeOff, Save, RotateCcw, CheckCircle } from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Input, Select } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useSettingsStore } from '../store'
import { LLMProviderName } from '../types/settings'

const MODEL_OPTIONS: Record<LLMProviderName, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
  ollama: ['llama3', 'llama3.1', 'mistral', 'codellama', 'phi3']
}

export const Settings: React.FC = () => {
  const { settings, updateSettings, updateLLMProvider, resetSettings } = useSettingsStore()
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)

  const toggleKey = (name: string) => setShowKeys(s => ({ ...s, [name]: !s[name] }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* LLM Providers */}
      <Card>
        <CardHeader
          title="LLM Providers"
          subtitle="Configure AI model providers for your agents"
        />
        <div className="space-y-5">
          {settings.llmProviders.map(provider => (
            <div key={provider.name} className="p-4 bg-gray-800/50 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{provider.label}</span>
                  {provider.enabled && provider.apiKey && (
                    <Badge variant="success" dot>Active</Badge>
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => updateLLMProvider(provider.name, { enabled: !provider.enabled })}
                    className={`w-9 h-5 rounded-full transition-colors relative ${provider.enabled ? 'bg-brand-600' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${provider.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-xs text-gray-400">Enable</span>
                </label>
              </div>

              <div className="space-y-3">
                {provider.name !== 'ollama' ? (
                  <div className="relative">
                    <label className="text-xs font-medium text-gray-400 mb-1 block">API Key</label>
                    <div className="flex gap-2">
                      <input
                        type={showKeys[provider.name] ? 'text' : 'password'}
                        value={provider.apiKey}
                        onChange={e => updateLLMProvider(provider.name, { apiKey: e.target.value })}
                        placeholder={`Enter ${provider.label} API key`}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <button
                        onClick={() => toggleKey(provider.name)}
                        className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"
                      >
                        {showKeys[provider.name] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <Input
                    label="Base URL"
                    value={provider.baseUrl || ''}
                    onChange={e => updateLLMProvider(provider.name, { baseUrl: e.target.value })}
                    placeholder="http://localhost:11434"
                    hint="URL of your Ollama instance"
                  />
                )}

                <Select
                  label="Default Model"
                  value={provider.model}
                  onChange={e => updateLLMProvider(provider.name, { model: e.target.value })}
                  options={MODEL_OPTIONS[provider.name].map(m => ({ value: m, label: m }))}
                />
              </div>
            </div>
          ))}

          <Select
            label="Default Provider"
            value={settings.defaultLLMProvider}
            onChange={e => updateSettings({ defaultLLMProvider: e.target.value as LLMProviderName })}
            options={settings.llmProviders.map(p => ({ value: p.name, label: p.label }))}
          />
        </div>
      </Card>

      {/* Telegram Settings */}
      <Card>
        <CardHeader title="Telegram Reports" subtitle="Daily report configuration" />
        <div className="space-y-4">
          <Input
            label="Group Chat ID"
            value={settings.telegram.groupChatId}
            onChange={e => updateSettings({ telegram: { ...settings.telegram, groupChatId: e.target.value } })}
            placeholder="-100123456789"
            hint="Shared Telegram group for all agent daily reports"
          />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-400 mb-1 block">Report Time</label>
              <input
                type="time"
                value={settings.telegram.reportTime}
                onChange={e => updateSettings({ telegram: { ...settings.telegram, reportTime: e.target.value } })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-5">
              <div
                onClick={() => updateSettings({ telegram: { ...settings.telegram, reportEnabled: !settings.telegram.reportEnabled } })}
                className={`w-9 h-5 rounded-full transition-colors relative ${settings.telegram.reportEnabled ? 'bg-brand-600' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.telegram.reportEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-gray-300">Enabled</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader title="Notifications" />
        <div className="space-y-3">
          {[
            { key: 'desktop' as const, label: 'Desktop Notifications', desc: 'Show system notifications' },
            { key: 'sound' as const, label: 'Sound Alerts', desc: 'Play sounds for important events' },
            { key: 'dailyReport' as const, label: 'Daily Report Reminder', desc: 'Remind before sending daily report' }
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-800/50">
              <div>
                <div className="text-sm text-white">{item.label}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
              <div
                onClick={() => updateSettings({
                  notifications: { ...settings.notifications, [item.key]: !settings.notifications[item.key] }
                })}
                className={`w-9 h-5 rounded-full transition-colors relative ${settings.notifications[item.key] ? 'bg-brand-600' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.notifications[item.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} icon={saved ? <CheckCircle size={14} /> : <Save size={14} />}>
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => { if (confirm('Reset all settings to defaults?')) resetSettings() }}
          icon={<RotateCcw size={14} />}
        >
          Reset Defaults
        </Button>
      </div>
    </div>
  )
}
