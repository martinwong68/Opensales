import React, { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Select } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { CheckCircle } from 'lucide-react'
import { useIntegrationStore } from '../../store'

export const WhatsAppConfig: React.FC = () => {
  const { integrations, addIntegration, updateIntegration } = useIntegrationStore()
  const existing = integrations.find(i => i.type === 'whatsapp_twilio' || i.type === 'whatsapp_meta')

  const [provider, setProvider] = useState('twilio')
  const [config, setConfig] = useState({
    accountSid: existing?.config.accountSid || '',
    authToken: existing?.config.authToken || '',
    whatsappNumber: existing?.config.whatsappNumber || '',
    metaToken: existing?.config.metaToken || '',
    phoneNumberId: existing?.config.phoneNumberId || '',
    businessAccountId: existing?.config.businessAccountId || ''
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const data = {
      type: provider === 'meta' ? 'whatsapp_meta' as const : 'whatsapp_twilio' as const,
      name: provider === 'meta' ? 'WhatsApp (Meta Business)' : 'WhatsApp (Twilio)',
      status: 'connected' as const,
      config
    }
    if (existing) {
      updateIntegration(existing.id, data)
    } else {
      addIntegration(data)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">WhatsApp Configuration</h3>
        <p className="text-xs text-gray-500">
          Connect WhatsApp via Twilio or Meta Business API for the WhatsApp Agent.
        </p>
      </div>

      <Select
        label="Provider"
        value={provider}
        onChange={e => setProvider(e.target.value)}
        options={[
          { value: 'twilio', label: 'Twilio WhatsApp' },
          { value: 'meta', label: 'Meta Business API' }
        ]}
      />

      {provider === 'twilio' ? (
        <div className="space-y-4">
          <Input
            label="Account SID"
            placeholder="AC..."
            value={config.accountSid}
            onChange={e => setConfig(c => ({ ...c, accountSid: e.target.value }))}
          />
          <Input
            label="Auth Token"
            type="password"
            placeholder="••••••••"
            value={config.authToken}
            onChange={e => setConfig(c => ({ ...c, authToken: e.target.value }))}
          />
          <Input
            label="WhatsApp Number"
            placeholder="+14155238886"
            value={config.whatsappNumber}
            onChange={e => setConfig(c => ({ ...c, whatsappNumber: e.target.value }))}
            hint="Your Twilio WhatsApp-enabled number"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="Access Token"
            type="password"
            placeholder="EAA..."
            value={config.metaToken}
            onChange={e => setConfig(c => ({ ...c, metaToken: e.target.value }))}
          />
          <Input
            label="Phone Number ID"
            placeholder="123456789"
            value={config.phoneNumberId}
            onChange={e => setConfig(c => ({ ...c, phoneNumberId: e.target.value }))}
          />
          <Input
            label="Business Account ID"
            placeholder="987654321"
            value={config.businessAccountId}
            onChange={e => setConfig(c => ({ ...c, businessAccountId: e.target.value }))}
          />
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-xs bg-emerald-900/30 text-emerald-400">
          <CheckCircle size={14} />
          WhatsApp configuration saved successfully.
        </div>
      )}

      <Button onClick={handleSave} className="w-full">Save Configuration</Button>

      {existing && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Badge variant="success" dot>Configured</Badge>
        </div>
      )}
    </div>
  )
}
