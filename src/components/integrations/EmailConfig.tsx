import React, { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Select } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { useIntegrationStore } from '../../store'

export const EmailConfig: React.FC = () => {
  const { integrations, addIntegration, updateIntegration } = useIntegrationStore()
  const existing = integrations.find(i => i.type === 'email_smtp')

  const [provider, setProvider] = useState('smtp')
  const [config, setConfig] = useState({
    host: existing?.config.host || '',
    port: existing?.config.port || '587',
    secure: existing?.config.secure || 'false',
    user: existing?.config.user || '',
    pass: existing?.config.pass || '',
    from: existing?.config.from || '',
    sendgridKey: existing?.config.sendgridKey || ''
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const handleSave = () => {
    const data = {
      type: provider === 'sendgrid' ? 'sendgrid' as const : 'email_smtp' as const,
      name: provider === 'sendgrid' ? 'SendGrid' : 'SMTP Email',
      status: 'connected' as const,
      config
    }
    if (existing) {
      updateIntegration(existing.id, data)
    } else {
      addIntegration(data)
    }
    setTestResult({ ok: true, msg: 'Email configuration saved.' })
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      // In a real app, would send a test email via IPC
      await new Promise(r => setTimeout(r, 1000))
      if (!config.host && !config.sendgridKey) {
        setTestResult({ ok: false, msg: 'Please fill in the configuration first.' })
      } else {
        setTestResult({ ok: true, msg: 'Configuration looks valid. Save and test by running an agent.' })
      }
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Email Configuration</h3>
        <p className="text-xs text-gray-500">Configure email sending for the Email Marketing Agent.</p>
      </div>

      <Select
        label="Email Provider"
        value={provider}
        onChange={e => setProvider(e.target.value)}
        options={[
          { value: 'smtp', label: 'SMTP' },
          { value: 'sendgrid', label: 'SendGrid' },
          { value: 'gmail', label: 'Gmail SMTP' }
        ]}
      />

      {provider === 'sendgrid' ? (
        <Input
          label="SendGrid API Key"
          placeholder="SG.xxxx"
          value={config.sendgridKey}
          onChange={e => setConfig(c => ({ ...c, sendgridKey: e.target.value }))}
          type="password"
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SMTP Host"
              placeholder="smtp.gmail.com"
              value={config.host}
              onChange={e => setConfig(c => ({ ...c, host: e.target.value }))}
            />
            <Input
              label="Port"
              placeholder="587"
              value={config.port}
              onChange={e => setConfig(c => ({ ...c, port: e.target.value }))}
              type="number"
            />
          </div>
          <Select
            label="Security"
            value={config.secure}
            onChange={e => setConfig(c => ({ ...c, secure: e.target.value }))}
            options={[
              { value: 'false', label: 'STARTTLS (port 587)' },
              { value: 'true', label: 'SSL/TLS (port 465)' }
            ]}
          />
          <Input
            label="Username / Email"
            placeholder="you@example.com"
            value={config.user}
            onChange={e => setConfig(c => ({ ...c, user: e.target.value }))}
          />
          <Input
            label="Password / App Password"
            type="password"
            placeholder="••••••••"
            value={config.pass}
            onChange={e => setConfig(c => ({ ...c, pass: e.target.value }))}
          />
          <Input
            label="From Address"
            placeholder="Opensales <noreply@example.com>"
            value={config.from}
            onChange={e => setConfig(c => ({ ...c, from: e.target.value }))}
          />
        </div>
      )}

      {testResult && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-xs ${testResult.ok ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
          {testResult.ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {testResult.msg}
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1">Save Configuration</Button>
        <Button variant="secondary" onClick={handleTest} loading={testing}>Test</Button>
      </div>

      {existing && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Badge variant="success" dot>Configured</Badge>
        </div>
      )}
    </div>
  )
}
