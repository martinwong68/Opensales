"use strict";
const electron = require("electron");
const api = {
  // Settings
  settings: {
    get: (key) => electron.ipcRenderer.invoke("settings:get", key),
    set: (key, value) => electron.ipcRenderer.invoke("settings:set", key, value),
    delete: (key) => electron.ipcRenderer.invoke("settings:delete", key),
    getAll: () => electron.ipcRenderer.invoke("settings:getAll")
  },
  // Telegram
  telegram: {
    sendMessage: (params) => electron.ipcRenderer.invoke("telegram:sendMessage", params),
    getUpdates: (botToken) => electron.ipcRenderer.invoke("telegram:getUpdates", botToken),
    getMe: (botToken) => electron.ipcRenderer.invoke("telegram:getMe", botToken)
  },
  // LLM providers
  llm: {
    openai: (params) => electron.ipcRenderer.invoke("llm:openai", params),
    anthropic: (params) => electron.ipcRenderer.invoke("llm:anthropic", params),
    ollama: (params) => electron.ipcRenderer.invoke("llm:ollama", params)
  },
  // Email
  email: {
    send: (params) => electron.ipcRenderer.invoke("email:send", params)
  },
  // Shopify
  shopify: {
    request: (params) => electron.ipcRenderer.invoke("shopify:request", params)
  },
  // WordPress
  wordpress: {
    request: (params) => electron.ipcRenderer.invoke("wordpress:request", params)
  },
  // Scheduling
  cron: {
    schedule: (params) => electron.ipcRenderer.invoke("cron:schedule", params),
    unschedule: (jobId) => electron.ipcRenderer.invoke("cron:unschedule", jobId),
    onTrigger: (callback) => {
      electron.ipcRenderer.on("cron:trigger", (_e, payload) => callback(payload));
    }
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", api);
