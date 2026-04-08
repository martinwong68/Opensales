import React from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'orange' | 'teal'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  dot?: boolean
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-800 text-gray-300 border-gray-700',
  success: 'bg-emerald-900/50 text-emerald-400 border-emerald-800',
  warning: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  error: 'bg-red-900/50 text-red-400 border-red-800',
  info: 'bg-blue-900/50 text-blue-400 border-blue-800',
  purple: 'bg-purple-900/50 text-purple-400 border-purple-800',
  orange: 'bg-orange-900/50 text-orange-400 border-orange-800',
  teal: 'bg-teal-900/50 text-teal-400 border-teal-800'
}

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  success: 'bg-emerald-400',
  warning: 'bg-yellow-400',
  error: 'bg-red-400',
  info: 'bg-blue-400',
  purple: 'bg-purple-400',
  orange: 'bg-orange-400',
  teal: 'bg-teal-400'
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  dot = false,
  className = ''
}) => (
  <span className={`
    inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border
    ${variantStyles[variant]} ${className}
  `}>
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />}
    {children}
  </span>
)
