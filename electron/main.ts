import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import cron from 'node-cron'

// Suppress Electron security warnings in development
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

const store = new Store<Record<string, unknown>>()

let mainWindow: BrowserWindow | null = null
let cronJobs: Map<string, cron.ScheduledTask> = new Map()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0f1117',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

// ─── Settings IPC ────────────────────────────────────────────────
ipcMain.handle('settings:get', (_e, key: string) => {
  return store.get(key)
})

ipcMain.handle('settings:set', (_e, key: string, value: unknown) => {
  store.set(key, value)
  return true
})

ipcMain.handle('settings:delete', (_e, key: string) => {
  store.delete(key)
  return true
})

ipcMain.handle('settings:getAll', () => {
  return store.store
})

// ─── Telegram IPC ────────────────────────────────────────────────
ipcMain.handle('telegram:sendMessage', async (_e, params: {
  botToken: string
  chatId: string
  text: string
}) => {
  try {
    const url = `https://api.telegram.org/bot${params.botToken}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: params.chatId, text: params.text, parse_mode: 'HTML' })
    })
    const data = await res.json() as { ok: boolean; description?: string }
    if (!data.ok) throw new Error(data.description || 'Telegram error')
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

ipcMain.handle('telegram:getUpdates', async (_e, botToken: string) => {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`)
    const data = await res.json() as { ok: boolean; result?: unknown[] }
    return data
  } catch (err) {
    return { ok: false, error: String(err) }
  }
})

ipcMain.handle('telegram:getMe', async (_e, botToken: string) => {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
    const data = await res.json() as { ok: boolean; result?: { username: string; first_name: string } }
    return data
  } catch (err) {
    return { ok: false, error: String(err) }
  }
})

// ─── OpenAI IPC ──────────────────────────────────────────────────
ipcMain.handle('llm:openai', async (_e, params: {
  apiKey: string
  model: string
  messages: Array<{ role: string; content: string }>
  temperature?: number
}) => {
  try {
    const { OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: params.apiKey })
    const resp = await client.chat.completions.create({
      model: params.model || 'gpt-4o',
      messages: params.messages as Parameters<typeof client.chat.completions.create>[0]['messages'],
      temperature: params.temperature ?? 0.7
    })
    return { success: true, content: resp.choices[0]?.message?.content ?? '' }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

// ─── Anthropic IPC ───────────────────────────────────────────────
ipcMain.handle('llm:anthropic', async (_e, params: {
  apiKey: string
  model: string
  messages: Array<{ role: string; content: string }>
  temperature?: number
}) => {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: params.apiKey })
    const resp = await client.messages.create({
      model: params.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: params.messages as Parameters<typeof client.messages.create>[0]['messages'],
      temperature: params.temperature ?? 0.7
    })
    const textBlock = resp.content.find(b => b.type === 'text')
    return { success: true, content: textBlock && 'text' in textBlock ? textBlock.text : '' }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

// ─── Ollama IPC ──────────────────────────────────────────────────
ipcMain.handle('llm:ollama', async (_e, params: {
  baseUrl: string
  model: string
  messages: Array<{ role: string; content: string }>
}) => {
  try {
    const url = `${params.baseUrl || 'http://localhost:11434'}/api/chat`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: params.model, messages: params.messages, stream: false })
    })
    const data = await res.json() as { message?: { content: string }; error?: string }
    if (data.error) throw new Error(data.error)
    return { success: true, content: data.message?.content ?? '' }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

// ─── Email IPC ───────────────────────────────────────────────────
ipcMain.handle('email:send', async (_e, params: {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
  to: string
  subject: string
  html: string
}) => {
  try {
    const nodemailer = await import('nodemailer')
    const transport = nodemailer.default.createTransport({
      host: params.host,
      port: params.port,
      secure: params.secure,
      auth: { user: params.user, pass: params.pass }
    })
    await transport.sendMail({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html
    })
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

// ─── Shopify IPC ─────────────────────────────────────────────────
ipcMain.handle('shopify:request', async (_e, params: {
  shopDomain: string
  accessToken: string
  endpoint: string
  method?: string
  body?: unknown
}) => {
  try {
    const url = `https://${params.shopDomain}/admin/api/2024-01/${params.endpoint}`
    const res = await fetch(url, {
      method: params.method || 'GET',
      headers: {
        'X-Shopify-Access-Token': params.accessToken,
        'Content-Type': 'application/json'
      },
      body: params.body ? JSON.stringify(params.body) : undefined
    })
    const data = await res.json()
    return { success: true, data }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

// ─── WordPress IPC ───────────────────────────────────────────────
ipcMain.handle('wordpress:request', async (_e, params: {
  siteUrl: string
  username: string
  password: string
  endpoint: string
  method?: string
  body?: unknown
}) => {
  try {
    const credentials = Buffer.from(`${params.username}:${params.password}`).toString('base64')
    const url = `${params.siteUrl}/wp-json/wp/v2/${params.endpoint}`
    const res = await fetch(url, {
      method: params.method || 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: params.body ? JSON.stringify(params.body) : undefined
    })
    const data = await res.json()
    return { success: true, data }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

// ─── Cron/Scheduling IPC ─────────────────────────────────────────
ipcMain.handle('cron:schedule', (_e, params: {
  jobId: string
  cronExpression: string
  agentId: string
}) => {
  if (cronJobs.has(params.jobId)) {
    cronJobs.get(params.jobId)!.stop()
  }
  const task = cron.schedule(params.cronExpression, () => {
    mainWindow?.webContents.send('cron:trigger', { jobId: params.jobId, agentId: params.agentId })
  })
  cronJobs.set(params.jobId, task)
  return { success: true }
})

ipcMain.handle('cron:unschedule', (_e, jobId: string) => {
  if (cronJobs.has(jobId)) {
    cronJobs.get(jobId)!.stop()
    cronJobs.delete(jobId)
  }
  return { success: true }
})

// ─── App lifecycle ────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  cronJobs.forEach(j => j.stop())
  if (process.platform !== 'darwin') app.quit()
})
