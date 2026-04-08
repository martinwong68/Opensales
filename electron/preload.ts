import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // Settings
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('settings:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('settings:delete', key),
    getAll: () => ipcRenderer.invoke('settings:getAll')
  },

  // Telegram
  telegram: {
    sendMessage: (params: { botToken: string; chatId: string; text: string }) =>
      ipcRenderer.invoke('telegram:sendMessage', params),
    getUpdates: (botToken: string) => ipcRenderer.invoke('telegram:getUpdates', botToken),
    getMe: (botToken: string) => ipcRenderer.invoke('telegram:getMe', botToken)
  },

  // LLM providers
  llm: {
    openai: (params: {
      apiKey: string
      model: string
      messages: Array<{ role: string; content: string }>
      temperature?: number
    }) => ipcRenderer.invoke('llm:openai', params),

    anthropic: (params: {
      apiKey: string
      model: string
      messages: Array<{ role: string; content: string }>
      temperature?: number
    }) => ipcRenderer.invoke('llm:anthropic', params),

    ollama: (params: {
      baseUrl: string
      model: string
      messages: Array<{ role: string; content: string }>
    }) => ipcRenderer.invoke('llm:ollama', params)
  },

  // Email
  email: {
    send: (params: {
      host: string
      port: number
      secure: boolean
      user: string
      pass: string
      from: string
      to: string
      subject: string
      html: string
    }) => ipcRenderer.invoke('email:send', params)
  },

  // Shopify
  shopify: {
    request: (params: {
      shopDomain: string
      accessToken: string
      endpoint: string
      method?: string
      body?: unknown
    }) => ipcRenderer.invoke('shopify:request', params)
  },

  // WordPress
  wordpress: {
    request: (params: {
      siteUrl: string
      username: string
      password: string
      endpoint: string
      method?: string
      body?: unknown
    }) => ipcRenderer.invoke('wordpress:request', params)
  },

  // Scheduling
  cron: {
    schedule: (params: { jobId: string; cronExpression: string; agentId: string }) =>
      ipcRenderer.invoke('cron:schedule', params),
    unschedule: (jobId: string) => ipcRenderer.invoke('cron:unschedule', jobId),
    onTrigger: (callback: (payload: { jobId: string; agentId: string }) => void) => {
      ipcRenderer.on('cron:trigger', (_e, payload) => callback(payload))
    }
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
