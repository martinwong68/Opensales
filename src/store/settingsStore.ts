import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings, DEFAULT_SETTINGS, LLMProvider, LLMProviderName } from '../types/settings'

interface SettingsState {
  settings: AppSettings
  updateSettings: (updates: Partial<AppSettings>) => void
  updateLLMProvider: (name: LLMProviderName, updates: Partial<LLMProvider>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (updates) => {
        set(s => ({ settings: { ...s.settings, ...updates } }))
      },

      updateLLMProvider: (name, updates) => {
        set(s => ({
          settings: {
            ...s.settings,
            llmProviders: s.settings.llmProviders.map(p =>
              p.name === name ? { ...p, ...updates } : p
            )
          }
        }))
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS })
      }
    }),
    { name: 'opensales-settings' }
  )
)
