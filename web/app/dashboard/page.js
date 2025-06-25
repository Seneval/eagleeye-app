import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { TodoQuickAdd } from '@/components/todos/TodoQuickAdd'
import { TodoList } from '@/components/todos/TodoList'
import { TodoSection } from '@/components/todos/TodoSection'
import { GoalProgress } from '@/components/GoalProgress'
import { DailyStats } from '@/components/DailyStats'
import { PriorityOverview } from '@/components/PriorityOverview'
import { AIBotsCard } from '@/components/ai/AIBotsCard'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get date ranges
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0]

  // Fetch today's todos
  const { data: todaysTodos } = await supabase
    .from('daily_todos')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', todayStr)
    .order('position')

  // Fetch yesterday's incomplete todos
  const { data: yesterdaysTodos } = await supabase
    .from('daily_todos')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', yesterdayStr)
    .eq('completed', false)
    .order('position')

  // Fetch overdue todos (older than yesterday and incomplete)
  const { data: overdueTodos } = await supabase
    .from('daily_todos')
    .select('*')
    .eq('user_id', user.id)
    .lt('date', yesterdayStr)
    .eq('completed', false)
    .order('date', { ascending: false })
    .order('position')

  // Fetch active goals
  const { data: goals } = await supabase
    .from('business_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('target_date')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Here's what needs your attention today</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 mb-8 md:grid-cols-4">
        <DailyStats todos={todaysTodos || []} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodoQuickAdd />
          
          {/* Today's Tasks */}
          <TodoList todos={todaysTodos || []} />
          
          {/* Yesterday's Tasks */}
          {yesterdaysTodos && yesterdaysTodos.length > 0 && (
            <TodoSection 
              title="Yesterday's Tasks" 
              todos={yesterdaysTodos} 
              showCompleted={false}
              className="border-yellow-200 bg-yellow-50"
            />
          )}
          
          {/* Overdue Tasks */}
          {overdueTodos && overdueTodos.length > 0 && (
            <TodoSection 
              title="Overdue Tasks" 
              todos={overdueTodos} 
              showCompleted={false}
              className="border-red-200 bg-red-50"
            />
          )}
        </div>

        <div className="space-y-6">
          <PriorityOverview todos={todaysTodos || []} />
          <AIBotsCard />
          <GoalProgress goals={goals || []} />
        </div>
      </div>
    </div>
  )
}