import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Integration, IntegrationType } from '../types/integration'
import { v4 as uuid } from './uuid'

interface IntegrationState {
  integrations: Integration[]
  addIntegration: (integration: Omit<Integration, 'id'>) => void
  updateIntegration: (id: string, updates: Partial<Integration>) => void
  deleteIntegration: (id: string) => void
  getByType: (type: IntegrationType) => Integration | undefined
}

export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set, get) => ({
      integrations: [],

      addIntegration: (data) => {
        const integration: Integration = { ...data, id: uuid() }
        set(s => ({ integrations: [...s.integrations, integration] }))
      },

      updateIntegration: (id, updates) => {
        set(s => ({
          integrations: s.integrations.map(i => i.id === id ? { ...i, ...updates } : i)
        }))
      },

      deleteIntegration: (id) => {
        set(s => ({ integrations: s.integrations.filter(i => i.id !== id) }))
      },

      getByType: (type) => {
        return get().integrations.find(i => i.type === type)
      }
    }),
    { name: 'opensales-integrations' }
  )
)
