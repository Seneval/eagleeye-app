'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function GoalCard({ goal }) {
  const router = useRouter()
  const [progress, setProgress] = useState(goal.progress)
  const [updating, setUpdating] = useState(false)

  const daysLeft = Math.ceil(
    (new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)
  )

  const handleProgressUpdate = async (newProgress) => {
    setUpdating(true)
    setProgress(newProgress)

    try {
      const supabase = createClient()
      const updates = { progress: newProgress }
      
      if (newProgress === 100) {
        updates.status = 'completed'
      }

      const { error } = await supabase
        .from('business_goals')
        .update(updates)
        .eq('id', goal.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error updating goal:', error)
      setProgress(goal.progress)
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkComplete = () => handleProgressUpdate(100)

  return (
    <Card hover={goal.status === 'active'}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900">{goal.title}</h4>
          {goal.description && (
            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
          )}
        </div>
        <div className="text-right">
          <span className={`
            inline-block px-2 py-1 text-xs rounded
            ${goal.type === 'weekly' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}
          `}>
            {goal.type}
          </span>
          <p className="text-sm text-gray-500 mt-1">
            {goal.status === 'completed' 
              ? 'Completed' 
              : daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'
            }
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {goal.status === 'active' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleProgressUpdate(Math.min(progress + 25, 100))}
              disabled={updating || progress >= 100}
            >
              +25%
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleProgressUpdate(Math.max(progress - 25, 0))}
              disabled={updating || progress <= 0}
            >
              -25%
            </Button>
            {progress !== 100 && (
              <Button
                size="sm"
                onClick={handleMarkComplete}
                disabled={updating}
                className="ml-auto"
              >
                Mark Complete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}