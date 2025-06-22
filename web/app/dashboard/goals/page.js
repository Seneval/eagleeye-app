import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalForm } from '@/components/goals/GoalForm'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function GoalsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: goals } = await supabase
    .from('business_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('target_date')

  const activeGoals = goals?.filter(g => g.status === 'active') || []
  const completedGoals = goals?.filter(g => g.status === 'completed') || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Goals</h1>
        <p className="text-gray-600">Set and track your weekly and monthly targets</p>
      </div>

      <GoalForm />

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Goals</h2>
          <div className="space-y-4">
            {activeGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
            {activeGoals.length === 0 && (
              <Card>
                <p className="text-gray-500 text-center py-8">
                  No active goals. Create one above!
                </p>
              </Card>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Goals</h2>
          <div className="space-y-4 opacity-75">
            {completedGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
            {completedGoals.length === 0 && (
              <Card>
                <p className="text-gray-500 text-center py-8">
                  No completed goals yet
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}