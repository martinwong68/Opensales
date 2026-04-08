export type AgentType =
  | 'email'
  | 'social_media'
  | 'whatsapp'
  | 'seo'
  | 'sales_analytics'
  | 'ecommerce'

export type AgentStatus = 'active' | 'inactive' | 'running' | 'error'

export interface AgentSkill {
  id: string
  name: string
  description: string
  category: string
}

export interface AgentTask {
  id: string
  agentId: string
  name: string
  type: 'scheduled' | 'manual' | 'triggered'
  cronExpression?: string
  lastRun?: string
  nextRun?: string
  status: 'idle' | 'running' | 'success' | 'error'
  result?: string
  error?: string
}

export interface AgentLog {
  id: string
  agentId: string
  timestamp: string
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
  data?: unknown
}

export interface Agent {
  id: string
  name: string
  type: AgentType
  description: string
  status: AgentStatus
  llmProvider: string
  llmModel: string
  telegramBotToken?: string
  skills: AgentSkill[]
  tasks: AgentTask[]
  createdAt: string
  updatedAt: string
  metrics: AgentMetrics
  systemPrompt?: string
}

export interface AgentMetrics {
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  lastActivity?: string
  emailsSent?: number
  postsCreated?: number
  messagesSent?: number
  revenueTracked?: number
}

export const AGENT_SKILLS: Record<AgentType, AgentSkill[]> = {
  email: [
    { id: 'email_draft', name: 'Draft Campaigns', description: 'Write email marketing campaigns', category: 'content' },
    { id: 'email_ab_test', name: 'A/B Test Subject Lines', description: 'Generate multiple subject line variants', category: 'optimization' },
    { id: 'email_analyze', name: 'Analyze Open Rates', description: 'Analyze and report on email performance', category: 'analytics' },
    { id: 'email_schedule', name: 'Schedule Campaigns', description: 'Schedule emails for optimal send times', category: 'automation' },
    { id: 'email_personalize', name: 'Personalize Content', description: 'Personalize email content per recipient', category: 'content' },
    { id: 'email_sequence', name: 'Build Sequences', description: 'Create automated email sequences', category: 'automation' }
  ],
  social_media: [
    { id: 'social_post', name: 'Create Posts', description: 'Generate social media posts', category: 'content' },
    { id: 'social_schedule', name: 'Schedule Content', description: 'Schedule posts across platforms', category: 'automation' },
    { id: 'social_analyze', name: 'Analyze Engagement', description: 'Track likes, shares, comments', category: 'analytics' },
    { id: 'social_hashtags', name: 'Hashtag Research', description: 'Find trending and relevant hashtags', category: 'optimization' },
    { id: 'social_reply', name: 'Reply to Comments', description: 'Auto-reply to comments and DMs', category: 'engagement' },
    { id: 'social_trend', name: 'Trend Monitoring', description: 'Monitor trending topics', category: 'research' }
  ],
  whatsapp: [
    { id: 'whatsapp_broadcast', name: 'Broadcast Messages', description: 'Send bulk WhatsApp messages', category: 'messaging' },
    { id: 'whatsapp_template', name: 'Message Templates', description: 'Create approved message templates', category: 'content' },
    { id: 'whatsapp_query', name: 'Handle Queries', description: 'Auto-respond to customer questions', category: 'engagement' },
    { id: 'whatsapp_catalog', name: 'Product Catalog', description: 'Manage product catalog messages', category: 'commerce' },
    { id: 'whatsapp_flow', name: 'Conversation Flows', description: 'Build automated chat flows', category: 'automation' }
  ],
  seo: [
    { id: 'seo_blog', name: 'Generate Blog Posts', description: 'Write SEO-optimized blog content', category: 'content' },
    { id: 'seo_meta', name: 'Optimize Meta Tags', description: 'Generate title and description tags', category: 'optimization' },
    { id: 'seo_keywords', name: 'Keyword Research', description: 'Find high-value keywords', category: 'research' },
    { id: 'seo_audit', name: 'Content Audit', description: 'Audit existing content for SEO', category: 'analytics' },
    { id: 'seo_backlink', name: 'Backlink Strategy', description: 'Identify backlink opportunities', category: 'strategy' },
    { id: 'seo_schema', name: 'Schema Markup', description: 'Generate structured data markup', category: 'technical' }
  ],
  sales_analytics: [
    { id: 'sales_track', name: 'Track Conversions', description: 'Monitor sales conversions', category: 'analytics' },
    { id: 'sales_report', name: 'Generate Reports', description: 'Create detailed sales reports', category: 'reporting' },
    { id: 'sales_forecast', name: 'Sales Forecasting', description: 'Predict future sales trends', category: 'analytics' },
    { id: 'sales_funnel', name: 'Funnel Analysis', description: 'Analyze sales funnel performance', category: 'analytics' },
    { id: 'sales_leads', name: 'Lead Scoring', description: 'Score and prioritize leads', category: 'automation' },
    { id: 'sales_insights', name: 'AI Insights', description: 'Generate actionable sales insights', category: 'analytics' }
  ],
  ecommerce: [
    { id: 'ecom_inventory', name: 'Monitor Inventory', description: 'Track stock levels and alerts', category: 'operations' },
    { id: 'ecom_description', name: 'Product Descriptions', description: 'Write compelling product copy', category: 'content' },
    { id: 'ecom_pricing', name: 'Dynamic Pricing', description: 'Update prices based on rules', category: 'automation' },
    { id: 'ecom_reviews', name: 'Review Management', description: 'Respond to product reviews', category: 'engagement' },
    { id: 'ecom_upsell', name: 'Upsell Recommendations', description: 'Generate upsell strategies', category: 'commerce' },
    { id: 'ecom_abandoned', name: 'Cart Recovery', description: 'Recover abandoned carts', category: 'automation' }
  ]
}

export const AGENT_TYPE_LABELS: Record<AgentType, string> = {
  email: 'Email Marketing',
  social_media: 'Social Media',
  whatsapp: 'WhatsApp',
  seo: 'SEO & Content',
  sales_analytics: 'Sales Analytics',
  ecommerce: 'E-commerce'
}

export const AGENT_TYPE_COLORS: Record<AgentType, string> = {
  email: 'blue',
  social_media: 'purple',
  whatsapp: 'green',
  seo: 'orange',
  sales_analytics: 'red',
  ecommerce: 'teal'
}
