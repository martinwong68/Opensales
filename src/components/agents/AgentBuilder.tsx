import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input, Select, Textarea } from '../ui/Input'
import { AgentSkillSelector } from './AgentSkillSelector'
import { AgentType, AgentSkill, AGENT_TYPE_LABELS } from '../../types/agent'
import { useAgentStore, useSettingsStore } from '../../store'

interface AgentBuilderProps {
  open: boolean
  onClose: () => void
}

const agentTypeOptions = (Object.entries(AGENT_TYPE_LABELS) as [AgentType, string][]).map(
  ([value, label]) => ({ value, label })
)

export const AgentBuilder: React.FC<AgentBuilderProps> = ({ open, onClose }) => {
  const { addAgent } = useAgentStore()
  const { settings } = useSettingsStore()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState({
    name: '',
    type: 'email' as AgentType,
    description: '',
    llmProvider: settings.defaultLLMProvider,
    llmModel: '',
    telegramBotToken: '',
    systemPrompt: '',
    skills: [] as AgentSkill[]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const llmOptions = settings.llmProviders.map(p => ({
    value: p.name,
    label: `${p.label}${!p.enabled ? ' (not configured)' : ''}`
  }))

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.description.trim()) e.description = 'Description is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step < 3) setStep(s => (s + 1) as 1 | 2 | 3)
  }

  const handleCreate = () => {
    const provider = settings.llmProviders.find(p => p.name === form.llmProvider)
    addAgent({
      name: form.name,
      type: form.type,
      description: form.description,
      status: 'inactive',
      llmProvider: form.llmProvider,
      llmModel: form.llmModel || provider?.model || '',
      telegramBotToken: form.telegramBotToken,
      systemPrompt: form.systemPrompt,
      skills: form.skills
    })
    onClose()
    setStep(1)
    setForm({
      name: '',
      type: 'email',
      description: '',
      llmProvider: settings.defaultLLMProvider,
      llmModel: '',
      telegramBotToken: '',
      systemPrompt: '',
      skills: []
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Agent"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleCreate}>Create Agent</Button>
          )}
        </>
      }
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`
              w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
              ${step >= s ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-500'}
            `}>
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-brand-600' : 'bg-gray-800'}`} />}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mb-6 -mt-4">
        <span>Basic Info</span>
        <span>LLM & Config</span>
        <span>Skills</span>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <Input
            label="Agent Name"
            placeholder="e.g. Email Campaign Wizard"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            error={errors.name}
          />
          <Select
            label="Agent Type"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value as AgentType, skills: [] }))}
            options={agentTypeOptions}
          />
          <Textarea
            label="Description"
            placeholder="Describe what this agent does..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            error={errors.description}
            rows={3}
          />
        </div>
      )}

      {/* Step 2: LLM & Config */}
      {step === 2 && (
        <div className="space-y-4">
          <Select
            label="LLM Provider"
            value={form.llmProvider}
            onChange={e => setForm(f => ({ ...f, llmProvider: e.target.value }))}
            options={llmOptions}
          />
          <Input
            label="Model Override (optional)"
            placeholder="Leave blank to use provider default"
            value={form.llmModel}
            onChange={e => setForm(f => ({ ...f, llmModel: e.target.value }))}
            hint="e.g. gpt-4o, claude-3-5-sonnet-20241022, llama3"
          />
          <Input
            label="Telegram Bot Token (optional)"
            placeholder="123456789:AABBCCdd..."
            value={form.telegramBotToken}
            onChange={e => setForm(f => ({ ...f, telegramBotToken: e.target.value }))}
            hint="Give this agent its own Telegram bot for notifications"
            type="password"
          />
          <Textarea
            label="System Prompt (optional)"
            placeholder="Custom instructions for this agent..."
            value={form.systemPrompt}
            onChange={e => setForm(f => ({ ...f, systemPrompt: e.target.value }))}
            rows={4}
          />
        </div>
      )}

      {/* Step 3: Skills */}
      {step === 3 && (
        <AgentSkillSelector
          agentType={form.type}
          selectedSkills={form.skills}
          onChange={skills => setForm(f => ({ ...f, skills }))}
        />
      )}
    </Modal>
  )
}
