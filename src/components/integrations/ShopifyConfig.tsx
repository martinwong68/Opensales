import React, { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { useIntegrationStore } from '../../store'

export const ShopifyConfig: React.FC = () => {
  const { integrations, addIntegration, updateIntegration } = useIntegrationStore()
  const existing = integrations.find(i => i.type === 'shopify')

  const [config, setConfig] = useState({
    shopDomain: existing?.config.shopDomain || '',
    accessToken: existing?.config.accessToken || ''
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const handleSave = () => {
    const data = {
      type: 'shopify' as const,
      name: `Shopify (${config.shopDomain})`,
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
    if (!config.shopDomain || !config.accessToken) {
      setTestResult({ ok: false, msg: 'Please fill in all fields.' })
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const api = (window as unknown as { electronAPI: { shopify: { request: (p: unknown) => Promise<{ success: boolean; data?: unknown; error?: string }> } } }).electronAPI
      const result = await api.shopify.request({
        shopDomain: config.shopDomain,
        accessToken: config.accessToken,
        endpoint: 'shop.json'
      })
      if (result.success) {
        const shopData = result.data as { shop?: { name: string } }
        handleSave()
        setTestResult({ ok: true, msg: `Connected to ${shopData.shop?.name || config.shopDomain}!` })
        updateIntegration(existing?.id || '', { status: 'connected' })
      } else {
        setTestResult({ ok: false, msg: result.error || 'Connection failed.' })
      }
    } catch {
      setTestResult({ ok: false, msg: 'Failed to connect to Shopify.' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Shopify Integration</h3>
        <p className="text-xs text-gray-500">
          Connect your Shopify store to enable the E-commerce Agent to manage products, inventory, and orders.
        </p>
      </div>

      <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 text-xs text-blue-300">
        <p className="font-medium mb-1">Setup Instructions:</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-400/80">
          <li>Go to your Shopify Admin → Apps → Develop apps</li>
          <li>Create a private app with required scopes</li>
          <li>Copy the Admin API access token below</li>
        </ol>
      </div>

      <Input
        label="Shop Domain"
        placeholder="yourstore.myshopify.com"
        value={config.shopDomain}
        onChange={e => setConfig(c => ({ ...c, shopDomain: e.target.value }))}
        hint="Your Shopify store domain (without https://)"
      />
      <Input
        label="Admin API Access Token"
        type="password"
        placeholder="shpat_xxxx"
        value={config.accessToken}
        onChange={e => setConfig(c => ({ ...c, accessToken: e.target.value }))}
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
