"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const path = require("path");
const Store = require("electron-store");
const cron = require("node-cron");
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
const store = new Store();
let mainWindow = null;
let cronJobs = /* @__PURE__ */ new Map();
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: "#0f1117",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: false
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    electron.shell.openExternal(url);
    return { action: "deny" };
  });
  if (process.env.NODE_ENV === "development" || process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || "http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}
electron.ipcMain.handle("settings:get", (_e, key) => {
  return store.get(key);
});
electron.ipcMain.handle("settings:set", (_e, key, value) => {
  store.set(key, value);
  return true;
});
electron.ipcMain.handle("settings:delete", (_e, key) => {
  store.delete(key);
  return true;
});
electron.ipcMain.handle("settings:getAll", () => {
  return store.store;
});
electron.ipcMain.handle("telegram:sendMessage", async (_e, params) => {
  try {
    const url = `https://api.telegram.org/bot${params.botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: params.chatId, text: params.text, parse_mode: "HTML" })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.description || "Telegram error");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});
electron.ipcMain.handle("telegram:getUpdates", async (_e, botToken) => {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
    const data = await res.json();
    return data;
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});
electron.ipcMain.handle("telegram:getMe", async (_e, botToken) => {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await res.json();
    return data;
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});
electron.ipcMain.handle("llm:openai", async (_e, params) => {
  try {
    const { OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: params.apiKey });
    const resp = await client.chat.completions.create({
      model: params.model || "gpt-4o",
      messages: params.messages,
      temperature: params.temperature ?? 0.7
    });
    return { success: true, content: resp.choices[0]?.message?.content ?? "" };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});
electron.ipcMain.handle("llm:anthropic", async (_e, params) => {
  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: params.apiKey });
    const resp = await client.messages.create({
      model: params.model || "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: params.messages,
      temperature: params.temperature ?? 0.7
    });
    const textBlock = resp.content.find((b) => b.type === "text");
    return { success: true, content: textBlock && "text" in textBlock ? textBlock.text : "" };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});
electron.ipcMain.handle("llm:ollama", async (_e, params) => {
  try {
    const url = `${params.baseUrl || "http://localhost:11434"}/api/chat`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: params.model, messages: params.messages, stream: false })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return { success: true, content: data.message?.content ?? "" };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});
electron.ipcMain.handle("email:send", async (_e, params) => {
  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.default.createTransport({
      host: params.host,
      port: params.port,
      secure: params.secure,
      auth: { user: params.user, pass: params.pass }
    });
    await transport.sendMail({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});
electron.ipcMain.handle("shopify:request", async (_e, params) => {
  try {
    const url = `https://${params.shopDomain}/admin/api/2024-01/${params.endpoint}`;
    const res = await fetch(url, {
      method: params.method || "GET",
      headers: {
        "X-Shopify-Access-Token": params.accessToken,
        "Content-Type": "application/json"
      },
      body: params.body ? JSON.stringify(params.body) : void 0
    });
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});
electron.ipcMain.handle("wordpress:request", async (_e, params) => {
  try {
    const credentials = Buffer.from(`${params.username}:${params.password}`).toString("base64");
    const url = `${params.siteUrl}/wp-json/wp/v2/${params.endpoint}`;
    const res = await fetch(url, {
      method: params.method || "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json"
      },
      body: params.body ? JSON.stringify(params.body) : void 0
    });
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});
electron.ipcMain.handle("cron:schedule", (_e, params) => {
  if (cronJobs.has(params.jobId)) {
    cronJobs.get(params.jobId).stop();
  }
  const task = cron.schedule(params.cronExpression, () => {
    mainWindow?.webContents.send("cron:trigger", { jobId: params.jobId, agentId: params.agentId });
  });
  cronJobs.set(params.jobId, task);
  return { success: true };
});
electron.ipcMain.handle("cron:unschedule", (_e, jobId) => {
  if (cronJobs.has(jobId)) {
    cronJobs.get(jobId).stop();
    cronJobs.delete(jobId);
  }
  return { success: true };
});
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  cronJobs.forEach((j) => j.stop());
  if (process.platform !== "darwin") electron.app.quit();
});
