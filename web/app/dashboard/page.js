import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { TodoQuickAdd } from '@/components/todos/TodoQuickAdd'
import { TodoList } from '@/components/todos/TodoList'
import { GoalProgress } from '@/components/GoalProgress'
import { DailyStats } from '@/components/DailyStats'
import { PriorityOverview } from '@/components/PriorityOverview'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch today's todos
  const today = new Date().toISOString().split('T')[0]
  const { data: todos } = await supabase
    .from('daily_todos')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
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
        <DailyStats todos={todos || []} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodoQuickAdd />
          <TodoList todos={todos || []} />
        </div>

        <div className="space-y-6">
          <PriorityOverview todos={todos || []} />
          <GoalProgress goals={goals || []} />
        </div>
      </div>
    </div>
  )
}