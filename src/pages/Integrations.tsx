import React, { useState } from 'react'
import {
  Send, Mail, MessageCircle, ShoppingBag, Globe, Twitter, Linkedin
} from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { TelegramConfig } from '../components/integrations/TelegramConfig'
import { EmailConfig } from '../components/integrations/EmailConfig'
import { WhatsAppConfig } from '../components/integrations/WhatsAppConfig'
import { ShopifyConfig } from '../components/integrations/ShopifyConfig'
import { WordPressConfig } from '../components/integrations/WordPressConfig'
import { useIntegrationStore } from '../store'

type TabId = 'telegram' | 'email' | 'whatsapp' | 'shopify' | 'wordpress' | 'social'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
  component: React.ReactNode
  badge?: string
}

const SocialConfig: React.FC = () => (
  <div className="space-y-4">
    <div>
      <h3 className="text-sm font-semibold text-white mb-1">Social Media Connections</h3>
      <p className="text-xs text-gray-500 mb-4">
        Connect your social media accounts for the Social Media Agent.
        OAuth-based connections are coming soon — configure API keys directly in agent settings for now.
      </p>
    </div>
    {[
      { name: 'Twitter/X', icon: <Twitter size={16} />, color: 'text-sky-400', description: 'Post tweets, reply to mentions, track engagement' },
      { name: 'LinkedIn', icon: <Linkedin size={16} />, color: 'text-blue-400', description: 'Share articles, company updates, professional content' },
      { name: 'Instagram', icon: '📸', color: 'text-pink-400', description: 'Schedule posts, stories, manage captions' },
      { name: 'Facebook', icon: '👥', color: 'text-blue-600', description: 'Page posts, ads management, audience insights' }
    ].map(platform => (
      <div key={platform.name} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-800">
        <div className="flex items-center gap-3">
          <span className={platform.color}>{platform.icon}</span>
          <div>
            <div className="text-sm font-medium text-white">{platform.name}</div>
            <div className="text-xs text-gray-500">{platform.description}</div>
          </div>
        </div>
        <Badge variant="warning">Coming Soon</Badge>
      </div>
    ))}
  </div>
)

export const Integrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('telegram')
  const { integrations } = useIntegrationStore()

  const getStatus = (type: string) => {
    const match = integrations.find(i => i.type === type || i.type.startsWith(type))
    return match?.status
  }

  const tabs: Tab[] = [
    {
      id: 'telegram',
      label: 'Telegram',
      icon: <Send size={16} />,
      component: <TelegramConfig />,
      badge: getStatus('telegram') === 'connected' ? 'connected' : undefined
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail size={16} />,
      component: <EmailConfig />,
      badge: getStatus('email') === 'connected' ? 'connected' : undefined
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <MessageCircle size={16} />,
      component: <WhatsAppConfig />,
      badge: getStatus('whatsapp') === 'connected' ? 'connected' : undefined
    },
    {
      id: 'shopify',
      label: 'Shopify',
      icon: <ShoppingBag size={16} />,
      component: <ShopifyConfig />,
      badge: getStatus('shopify') === 'connected' ? 'connected' : undefined
    },
    {
      id: 'wordpress',
      label: 'WordPress',
      icon: <Globe size={16} />,
      component: <WordPressConfig />,
      badge: getStatus('wordpress') === 'connected' ? 'connected' : undefined
    },
    {
      id: 'social',
      label: 'Social Media',
      icon: <Twitter size={16} />,
      component: <SocialConfig />
    }
  ]

  const activeTabData = tabs.find(t => t.id === activeTab)

  return (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left
                transition-all duration-150
                ${activeTab === tab.id
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }
              `}
            >
              <span className={activeTab === tab.id ? 'text-brand-400' : 'text-gray-500'}>
                {tab.icon}
              </span>
              <span className="flex-1">{tab.label}</span>
              {tab.badge && (
                <Badge variant="success" dot className="text-xs">
                  {tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="col-span-3">
          <Card>
            {activeTabData?.component}
          </Card>
        </div>
      </div>
    </div>
  )
}
