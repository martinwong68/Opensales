import React, { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { useIntegrationStore } from '../../store'

export const WordPressConfig: React.FC = () => {
  const { integrations, addIntegration, updateIntegration } = useIntegrationStore()
  const existing = integrations.find(i => i.type === 'wordpress')

  const [config, setConfig] = useState({
    siteUrl: existing?.config.siteUrl || '',
    username: existing?.config.username || '',
    password: existing?.config.password || ''
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const handleSave = () => {
    const data = {
      type: 'wordpress' as const,
      name: `WordPress (${config.siteUrl})`,
      status: 'pending' as const,
      config
    }
    if (existing) {
      updateIntegration(existing.id, data)
    } else {
      addIntegration(data)
    }
  }

  const handleTest = async () => {
    if (!config.siteUrl || !config.username || !config.password) {
      setTestResult({ ok: false, msg: 'Please fill in all fields.' })
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const api = (window as unknown as { electronAPI: { wordpress: { request: (p: unknown) => Promise<{ success: boolean; data?: unknown; error?: string }> } } }).electronAPI
      const result = await api.wordpress.request({
        siteUrl: config.siteUrl,
        username: config.username,
        password: config.password,
        endpoint: 'users/me'
      })
      if (result.success) {
        const userData = result.data as { name?: string }
        handleSave()
        setTestResult({ ok: true, msg: `Connected! Logged in as ${userData.name || config.username}` })
      } else {
        setTestResult({ ok: false, msg: 'Connection failed. Check your credentials.' })
      }
    } catch {
      setTestResult({ ok: false, msg: 'Failed to connect to WordPress.' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">WordPress / WooCommerce</h3>
        <p className="text-xs text-gray-500">
          Connect your WordPress site to publish SEO content and manage WooCommerce products.
        </p>
      </div>

      <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 text-xs text-blue-300">
        <p className="font-medium mb-1">Requirements:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-400/80">
          <li>WordPress 5.0+ with REST API enabled</li>
          <li>Application Password (WordPress → Users → Application Passwords)</li>
          <li>WooCommerce plugin for e-commerce features</li>
        </ul>
      </div>

      <Input
        label="Site URL"
        placeholder="https://yoursite.com"
        value={config.siteUrl}
        onChange={e => setConfig(c => ({ ...c, siteUrl: e.target.value }))}
        hint="Your WordPress site URL (include https://)"
      />
      <Input
        label="Username"
        placeholder="admin"
        value={config.username}
        onChange={e => setConfig(c => ({ ...c, username: e.target.value }))}
      />
      <Input
        label="Application Password"
        type="password"
        placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
        value={config.password}
        onChange={e => setConfig(c => ({ ...c, password: e.target.value }))}
        hint="Use an Application Password, not your login password"
      />

      {testResult && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-xs ${testResult.ok ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
          {testResult.ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {testResult.msg}
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1">Save</Button>
        <Button variant="secondary" onClick={handleTest} loading={testing}>
          Test Connection
        </Button>
      </div>

      {existing && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Badge variant={existing.status === 'connected' ? 'success' : 'warning'} dot>
            {existing.status}
          </Badge>
        </div>
      )}
    </div>
  )
}
