# Opensales

> AI-powered marketing & sales desktop application built with Electron, React, and TypeScript.

Opensales lets you create and manage autonomous AI agents that handle email marketing, social media, WhatsApp messaging, SEO content, sales analytics, and e-commerce operations — all from a single desktop app.

---

## Features

- **AI Agent Builder** — Create agents for six marketing & sales domains:
  - 📧 **Email Marketing** — Draft campaigns, A/B test subject lines, build sequences
  - 📱 **Social Media** — Generate posts, schedule content, monitor trends
  - 💬 **WhatsApp** — Broadcast messages, handle queries, conversation flows
  - 🔍 **SEO & Content** — Blog posts, keyword research, meta tag optimization
  - 📊 **Sales Analytics** — Track conversions, forecast sales, lead scoring
  - 🛒 **E-commerce** — Product descriptions, dynamic pricing, cart recovery
- **Multiple LLM Providers** — OpenAI, Anthropic (Claude), Google Gemini, and Ollama (local)
- **Integrations** — Telegram, Email (SMTP), WhatsApp, Shopify, and WordPress
- **Task Scheduling** — Cron-based scheduling for automated agent tasks
- **Dashboard** — Overview of agent activity, metrics, and recent logs
- **Reports** — Performance reporting and analytics
- **Dark UI** — Modern dark-themed interface built with Tailwind CSS

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) v9 or later
- (Optional) [Ollama](https://ollama.com/) for local LLM support

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/martinwong68/Opensales.git
cd Opensales
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

This launches the Electron app in development mode with hot-reload enabled.

### 4. Build for production

```bash
npm run build
```

### 5. Package a distributable

```bash
npm run dist
```

This creates a platform-specific installer in the `release/` directory.

---

## Usage

### Configure an LLM Provider

1. Open the app and navigate to **Settings** from the sidebar.
2. Under **LLM Providers**, enable at least one provider (OpenAI, Anthropic, Gemini, or Ollama).
3. Enter your API key (or set the Ollama base URL for local models).
4. Select a default model and save your settings.

### Set Up Integrations

1. Go to the **Integrations** page from the sidebar.
2. Configure any services your agents will use:
   - **Telegram** — Enter your bot token and chat ID for messaging and daily reports.
   - **Email** — Configure SMTP host, port, and credentials for sending email campaigns.
   - **WhatsApp** — Connect via Twilio or Meta Business API.
   - **Shopify** — Enter your shop domain and access token.
   - **WordPress** — Enter your site URL and credentials.

### Create an Agent

1. Navigate to the **Agents** page.
2. Click **New Agent**.
3. Choose an agent type (Email, Social Media, WhatsApp, SEO, Sales Analytics, or E-commerce).
4. Give your agent a name and description.
5. Select which LLM provider and model the agent should use.
6. Pick the skills you want the agent to have (e.g., "Draft Campaigns", "Keyword Research").
7. (Optional) Set a custom system prompt to control the agent's behavior.
8. Save the agent.

### Run and Monitor Agents

- From the **Agents** page or the **Dashboard**, click an agent to open its detail view.
- Run tasks manually or set up scheduled (cron-based) tasks for automation.
- View logs, metrics, and task history from the agent detail page.
- The **Dashboard** provides a summary of all agent activity, success rates, and recent logs.

### Telegram Daily Reports

1. In **Settings → Telegram Reports**, enter the group chat ID and set a report time.
2. Enable the daily report toggle.
3. Each agent can also have its own Telegram bot token for sending messages.

---

## Project Structure

```
Opensales/
├── electron/
│   ├── main.ts          # Electron main process (IPC handlers, window setup)
│   └── preload.ts       # Preload script (context bridge)
├── src/
│   ├── App.tsx           # Root component with routing
│   ├── main.tsx          # React entry point
│   ├── index.css         # Global styles
│   ├── components/       # Reusable UI components
│   │   ├── Layout/       # Sidebar, Header
│   │   ├── agents/       # Agent cards, builder
│   │   ├── integrations/ # Integration config panels
│   │   └── ui/           # Shared UI primitives (Card, Badge, Button, Input)
│   ├── pages/            # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── Agents.tsx
│   │   ├── AgentDetail.tsx
│   │   ├── Integrations.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── services/         # Backend service layers
│   │   ├── agents/       # Agent execution logic
│   │   ├── integrations/ # Telegram, email, etc.
│   │   └── llm/          # LLM provider abstraction
│   ├── store/            # Zustand state management
│   └── types/            # TypeScript type definitions
├── electron.vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── index.html
```

---

## Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Desktop Shell  | Electron                          |
| Frontend       | React 18, TypeScript              |
| Styling        | Tailwind CSS                      |
| State          | Zustand                           |
| Routing        | React Router (hash-based)         |
| Charts         | Recharts                          |
| Build Tool     | Vite (via electron-vite)          |
| LLM SDKs      | OpenAI, Anthropic, Ollama (fetch) |
| Integrations   | Nodemailer, Telegram Bot API, Shopify Admin API, WordPress REST API |
| Scheduling     | node-cron                         |
| Local Storage  | electron-store                    |

---

## Available Scripts

| Command          | Description                                      |
| ---------------- | ------------------------------------------------ |
| `npm run dev`    | Start the app in development mode with hot-reload |
| `npm run build`  | Build the app for production                     |
| `npm run preview`| Preview the production build                     |
| `npm run typecheck` | Run TypeScript type checking                  |
| `npm run dist`   | Build and package as a distributable             |

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).