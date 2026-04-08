export type IntegrationType =
  | 'telegram'
  | 'email_smtp'
  | 'sendgrid'
  | 'gmail'
  | 'whatsapp_twilio'
  | 'whatsapp_meta'
  | 'shopify'
  | 'wordpress'
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'facebook'

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending'

export interface Integration {
  id: string
  type: IntegrationType
  name: string
  status: IntegrationStatus
  config: Record<string, string>
  lastChecked?: string
  errorMessage?: string
}

export interface TelegramConfig {
  groupChatId: string
  reportTime: string // HH:MM format
  enabled: boolean
}

export const INTEGRATION_LABELS: Record<IntegrationType, string> = {
  telegram: 'Telegram',
  email_smtp: 'SMTP Email',
  sendgrid: 'SendGrid',
  gmail: 'Gmail',
  whatsapp_twilio: 'WhatsApp (Twilio)',
  whatsapp_meta: 'WhatsApp (Meta)',
  shopify: 'Shopify',
  wordpress: 'WordPress',
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook'
}

export const INTEGRATION_ICONS: Record<IntegrationType, string> = {
  telegram: '✈️',
  email_smtp: '📧',
  sendgrid: '📨',
  gmail: '📩',
  whatsapp_twilio: '💬',
  whatsapp_meta: '💬',
  shopify: '🛍️',
  wordpress: '📝',
  twitter: '🐦',
  linkedin: '💼',
  instagram: '📸',
  facebook: '👥'
}
