import { callLLM, ChatMessage } from '../llm'
import { Agent } from '../../types/agent'
import { AppSettings } from '../../types/settings'

export interface AgentRunParams {
  agent: Agent
  settings: AppSettings
  task: string
  context?: string
}

export interface AgentRunResult {
  success: boolean
  output?: string
  error?: string
  metadata?: Record<string, unknown>
}

async function runWithLLM(agent: Agent, settings: AppSettings, messages: ChatMessage[]): Promise<AgentRunResult> {
  const provider = settings.llmProviders.find(p => p.name === agent.llmProvider)
  if (!provider) {
    return { success: false, error: `LLM provider "${agent.llmProvider}" not found` }
  }
  if (!provider.apiKey && provider.name !== 'ollama') {
    return { success: false, error: `API key not configured for ${provider.label}` }
  }

  const result = await callLLM({
    provider: provider.name,
    apiKey: provider.apiKey,
    model: agent.llmModel || provider.model,
    messages,
    baseUrl: provider.baseUrl
  })

  return result.success
    ? { success: true, output: result.content }
    : { success: false, error: result.error }
}

export async function runEmailAgent(params: AgentRunParams): Promise<AgentRunResult> {
  const systemPrompt = params.agent.systemPrompt ||
    `You are an expert email marketing specialist. You create compelling, personalized email campaigns
that drive engagement and conversions. Focus on clear CTAs, personalization, and A/B testing opportunities.
Always follow email marketing best practices and CAN-SPAM/GDPR compliance.`

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: params.context ? `Context: ${params.context}\n\nTask: ${params.task}` : params.task }
  ]

  return runWithLLM(params.agent, params.settings, messages)
}

export async function runSocialMediaAgent(params: AgentRunParams): Promise<AgentRunResult> {
  const systemPrompt = params.agent.systemPrompt ||
    `You are a social media marketing expert with deep knowledge of Twitter/X, LinkedIn, Instagram, and Facebook.
You create engaging, platform-optimized content that builds brand awareness and drives engagement.
Include relevant hashtags, emojis, and CTAs appropriate for each platform.`

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: params.task }
  ]

  return runWithLLM(params.agent, params.settings, messages)
}

export async function runWhatsAppAgent(params: AgentRunParams): Promise<AgentRunResult> {
  const systemPrompt = params.agent.systemPrompt ||
    `You are a WhatsApp marketing specialist. You create concise, conversational messages
that feel personal and drive action. Keep messages under 200 words, use simple language,
and include clear CTAs. Always respect WhatsApp's business messaging guidelines.`

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: params.task }
  ]

  return runWithLLM(params.agent, params.settings, messages)
}

export async function runSEOAgent(params: AgentRunParams): Promise<AgentRunResult> {
  const systemPrompt = params.agent.systemPrompt ||
    `You are an SEO and content marketing expert. You create search-engine optimized content
that ranks well and provides genuine value to readers. Focus on target keywords, proper heading structure,
meta descriptions, and engagement metrics. Always write for humans first, search engines second.`

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: params.task }
  ]

  return runWithLLM(params.agent, params.settings, messages)
}

export async function runSalesAnalyticsAgent(params: AgentRunParams): Promise<AgentRunResult> {
  const systemPrompt = params.agent.systemPrompt ||
    `You are a sales analytics expert. You analyze sales data, identify trends, generate insights,
and provide actionable recommendations to improve conversion rates and revenue. Present data
clearly with specific metrics and percentage improvements where possible.`

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: params.context ? `Data: ${params.context}\n\nAnalyze: ${params.task}` : params.task }
  ]

  return runWithLLM(params.agent, params.settings, messages)
}

export async function runEcommerceAgent(params: AgentRunParams): Promise<AgentRunResult> {
  const systemPrompt = params.agent.systemPrompt ||
    `You are an e-commerce specialist with expertise in Shopify and WooCommerce. You optimize
product listings, write compelling product descriptions, manage inventory strategies, and
identify opportunities to increase average order value and customer lifetime value.`

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: params.task }
  ]

  return runWithLLM(params.agent, params.settings, messages)
}

export async function runAgent(params: AgentRunParams): Promise<AgentRunResult> {
  switch (params.agent.type) {
    case 'email': return runEmailAgent(params)
    case 'social_media': return runSocialMediaAgent(params)
    case 'whatsapp': return runWhatsAppAgent(params)
    case 'seo': return runSEOAgent(params)
    case 'sales_analytics': return runSalesAnalyticsAgent(params)
    case 'ecommerce': return runEcommerceAgent(params)
    default: return { success: false, error: `Unknown agent type: ${params.agent.type}` }
  }
}
