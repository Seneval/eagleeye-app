'use client'

import { Card } from '@/components/ui/Card'
import Link from 'next/link'

export function GoalProgress({ goals }) {
  const weeklyGoals = goals.filter(g => g.type === 'weekly')
  const monthlyGoals = goals.filter(g => g.type === 'monthly')

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Goals</h3>
        <Link href="/dashboard/goals" className="text-sm text-blue-600 hover:text-blue-700">
          View all →
        </Link>
      </div>
      
      <div className="space-y-4">
        {weeklyGoals.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">This Week</p>
            {weeklyGoals.slice(0, 2).map(goal => (
              <GoalItem key={goal.id} goal={goal} />
            ))}
          </div>
        )}

        {monthlyGoals.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">This Month</p>
            {monthlyGoals.slice(0, 2).map(goal => (
              <GoalItem key={goal.id} goal={goal} />
            ))}
          </div>
        )}

        {goals.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">
            No active goals yet.
            <Link href="/dashboard/goals" className="block text-blue-600 hover:text-blue-700 mt-1">
              Set your first goal →
            </Link>
          </p>
        )}
      </div>
    </Card>
  )
}

function GoalItem({ goal }) {
  const daysLeft = Math.ceil(
    (new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="mb-3">
      <div className="flex justify-between items-start mb-1">
        <p className="text-sm font-medium text-gray-900">{goal.title}</p>
        <span className="text-xs text-gray-500">
          {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
        </span>
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <span className="absolute right-0 -top-5 text-xs text-gray-600">
          {goal.progress}%
        </span>
      </div>
    </div>
  )
}