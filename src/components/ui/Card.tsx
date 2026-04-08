import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hover = false,
  padding = 'md'
}) => {
  const paddingMap = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6'
  }

  return (
    <div
      className={`
        bg-gray-900 border border-gray-800 rounded-xl
        ${paddingMap[padding]}
        ${hover ? 'hover:border-gray-700 hover:bg-gray-850 cursor-pointer transition-all duration-150' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action, icon }) => (
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-3">
      {icon && (
        <div className="p-2 rounded-lg bg-gray-800">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
)
