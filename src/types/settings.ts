export type LLMProviderName = 'openai' | 'anthropic' | 'gemini' | 'ollama'

export interface LLMProvider {
  name: LLMProviderName
  label: string
  apiKey: string
  model: string
  baseUrl?: string
  enabled: boolean
}

export interface AppSettings {
  theme: 'dark' | 'light'
  language: string
  llmProviders: LLMProvider[]
  defaultLLMProvider: LLMProviderName
  telegram: {
    groupChatId: string
    reportTime: string
    reportEnabled: boolean
  }
  notifications: {
    desktop: boolean
    sound: boolean
    dailyReport: boolean
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'en',
  llmProviders: [
    { name: 'openai', label: 'OpenAI', apiKey: '', model: 'gpt-4o', enabled: false },
    { name: 'anthropic', label: 'Anthropic (Claude)', apiKey: '', model: 'claude-3-5-sonnet-20241022', enabled: false },
    { name: 'gemini', label: 'Google Gemini', apiKey: '', model: 'gemini-1.5-pro', enabled: false },
    { name: 'ollama', label: 'Ollama (Local)', apiKey: '', model: 'llama3', baseUrl: 'http://localhost:11434', enabled: false }
  ],
  defaultLLMProvider: 'openai',
  telegram: {
    groupChatId: '',
    reportTime: '09:00',
    reportEnabled: true
  },
  notifications: {
    desktop: true,
    sound: false,
    dailyReport: true
  }
}
