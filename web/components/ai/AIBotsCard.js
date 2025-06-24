'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { BotAvatar } from './BotAvatar'
import { bots } from '@/lib/ai/bots'
import Link from 'next/link'

export function AIBotsCard() {
  const [usageStats, setUsageStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsageStats()
  }, [])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/ai/usage')
      if (response.ok) {
        const data = await response.json()
        setUsageStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch AI usage stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const botList = Object.values(bots)

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Assistants</h2>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-300 rounded" />
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {botList.map(bot => {
            const stats = usageStats?.stats?.[bot.id]
            const isAtLimit = stats && stats.remaining === 0
            
            return (
              <Link
                key={bot.id}
                href={`/ai/${bot.id}`}
                className={`block transition-colors ${
                  isAtLimit ? 'opacity-75' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <BotAvatar bot={bot} />
                    <div>
                      <p className="font-medium text-gray-900">{bot.name}</p>
                      <p className="text-sm text-gray-600">{bot.description}</p>
                    </div>
                  </div>
                  
                  {stats && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {stats.used}/{stats.limit}
                      </p>
                      {isAtLimit ? (
                        <p className="text-xs text-red-600">Limit reached</p>
                      ) : stats.remaining <= 3 ? (
                        <p className="text-xs text-orange-600">{stats.remaining} left</p>
                      ) : (
                        <p className="text-xs text-gray-500">messages today</p>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
      
      {usageStats?.tier === 'free' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Free tier: 10 messages/day per assistant
          </p>
          <Link
            href="/pricing"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Upgrade to Premium for 100 messages/day →
          </Link>
        </div>
      )}
    </Card>
  )
}