export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  success: boolean
  content?: string
  error?: string
}

type ElectronAPI = {
  llm: {
    openai: (p: { apiKey: string; model: string; messages: ChatMessage[]; temperature?: number }) => Promise<LLMResponse>
    anthropic: (p: { apiKey: string; model: string; messages: ChatMessage[]; temperature?: number }) => Promise<LLMResponse>
    ollama: (p: { baseUrl: string; model: string; messages: ChatMessage[] }) => Promise<LLMResponse>
  }
}

function getAPI(): ElectronAPI {
  return (window as unknown as { electronAPI: ElectronAPI }).electronAPI
}

export async function callLLM(params: {
  provider: string
  apiKey: string
  model: string
  messages: ChatMessage[]
  temperature?: number
  baseUrl?: string
}): Promise<LLMResponse> {
  const api = getAPI()

  switch (params.provider) {
    case 'openai':
      return api.llm.openai({
        apiKey: params.apiKey,
        model: params.model,
        messages: params.messages,
        temperature: params.temperature
      })

    case 'anthropic':
      return api.llm.anthropic({
        apiKey: params.apiKey,
        model: params.model,
        messages: params.messages.filter(m => m.role !== 'system'), // Anthropic uses separate system param
        temperature: params.temperature
      })

    case 'ollama':
      return api.llm.ollama({
        baseUrl: params.baseUrl || 'http://localhost:11434',
        model: params.model,
        messages: params.messages
      })

    default:
      return { success: false, error: `Unknown LLM provider: ${params.provider}` }
  }
}
