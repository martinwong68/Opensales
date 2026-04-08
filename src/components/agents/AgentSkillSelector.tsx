import React, { useState } from 'react'
import { AgentSkill, AgentType, AGENT_SKILLS } from '../../types/agent'
import { Badge } from '../ui/Badge'
import { Check } from 'lucide-react'

interface AgentSkillSelectorProps {
  agentType: AgentType
  selectedSkills: AgentSkill[]
  onChange: (skills: AgentSkill[]) => void
}

const categoryColors: Record<string, string> = {
  content: 'info',
  automation: 'purple',
  analytics: 'orange',
  optimization: 'success',
  engagement: 'teal',
  research: 'warning',
  commerce: 'error',
  messaging: 'info',
  operations: 'default',
  technical: 'default',
  strategy: 'purple',
  reporting: 'orange'
}

export const AgentSkillSelector: React.FC<AgentSkillSelectorProps> = ({
  agentType,
  selectedSkills,
  onChange
}) => {
  const allSkills = AGENT_SKILLS[agentType] || []
  const selectedIds = new Set(selectedSkills.map(s => s.id))

  const toggleSkill = (skill: AgentSkill) => {
    if (selectedIds.has(skill.id)) {
      onChange(selectedSkills.filter(s => s.id !== skill.id))
    } else {
      onChange([...selectedSkills, skill])
    }
  }

  const selectAll = () => onChange(allSkills)
  const clearAll = () => onChange([])

  const byCategory = allSkills.reduce<Record<string, AgentSkill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">Select skills for this agent</p>
        <div className="flex gap-2">
          <button onClick={selectAll} className="text-xs text-brand-400 hover:text-brand-300">Select all</button>
          <span className="text-gray-700">·</span>
          <button onClick={clearAll} className="text-xs text-gray-500 hover:text-gray-400">Clear</button>
        </div>
      </div>

      {Object.entries(byCategory).map(([category, skills]) => (
        <div key={category} className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={(categoryColors[category] as 'info' | 'purple' | 'orange' | 'success' | 'teal' | 'warning' | 'error' | 'default') || 'default'}>
              {category}
            </Badge>
          </div>
          <div className="space-y-1.5">
            {skills.map(skill => {
              const selected = selectedIds.has(skill.id)
              return (
                <button
                  key={skill.id}
                  onClick={() => toggleSkill(skill)}
                  className={`
                    w-full flex items-start gap-3 p-2.5 rounded-lg border text-left transition-all
                    ${selected
                      ? 'bg-brand-900/20 border-brand-700/50 text-brand-300'
                      : 'bg-gray-800/50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300'
                    }
                  `}
                >
                  <div className={`
                    w-4 h-4 rounded border flex items-center justify-center mt-0.5 flex-shrink-0
                    ${selected ? 'bg-brand-600 border-brand-600' : 'border-gray-600'}
                  `}>
                    {selected && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <div className="text-xs font-medium">{skill.name}</div>
                    <div className="text-xs text-gray-600">{skill.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-600 mt-2">
        {selectedSkills.length} of {allSkills.length} skills selected
      </p>
    </div>
  )
}
