import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Agent, AgentLog, AgentType, AgentTask, AGENT_SKILLS } from '../types/agent'
import { v4 as uuid } from './uuid'

interface AgentState {
  agents: Agent[]
  logs: AgentLog[]
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'metrics' | 'tasks'>) => Agent
  updateAgent: (id: string, updates: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  addLog: (log: Omit<AgentLog, 'id' | 'timestamp'>) => void
  clearLogs: (agentId?: string) => void
  getAgentLogs: (agentId: string) => AgentLog[]
  updateTask: (agentId: string, task: AgentTask) => void
  setAgentStatus: (id: string, status: Agent['status']) => void
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      agents: [],
      logs: [],

      addAgent: (agentData) => {
        const agent: Agent = {
          ...agentData,
          id: uuid(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metrics: {
            totalRuns: 0,
            successfulRuns: 0,
            failedRuns: 0
          },
          tasks: [],
          skills: agentData.skills?.length ? agentData.skills : AGENT_SKILLS[agentData.type as AgentType] || []
        }
        set(s => ({ agents: [...s.agents, agent] }))
        return agent
      },

      updateAgent: (id, updates) => {
        set(s => ({
          agents: s.agents.map(a =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          )
        }))
      },

      deleteAgent: (id) => {
        set(s => ({
          agents: s.agents.filter(a => a.id !== id),
          logs: s.logs.filter(l => l.agentId !== id)
        }))
      },

      addLog: (logData) => {
        const log: AgentLog = {
          ...logData,
          id: uuid(),
          timestamp: new Date().toISOString()
        }
        set(s => ({
          logs: [log, ...s.logs].slice(0, 1000) // keep last 1000 logs
        }))
      },

      clearLogs: (agentId) => {
        set(s => ({
          logs: agentId ? s.logs.filter(l => l.agentId !== agentId) : []
        }))
      },

      getAgentLogs: (agentId) => {
        return get().logs.filter(l => l.agentId === agentId)
      },

      updateTask: (agentId, task) => {
        set(s => ({
          agents: s.agents.map(a => {
            if (a.id !== agentId) return a
            const existing = a.tasks.findIndex(t => t.id === task.id)
            const tasks = existing >= 0
              ? a.tasks.map(t => t.id === task.id ? task : t)
              : [...a.tasks, task]
            return { ...a, tasks }
          })
        }))
      },

      setAgentStatus: (id, status) => {
        set(s => ({
          agents: s.agents.map(a => a.id === id ? { ...a, status } : a)
        }))
      }
    }),
    {
      name: 'opensales-agents'
    }
  )
)
