import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ContextForm } from '@/components/context/ContextForm'
import { redirect } from 'next/navigation'

export default async function ContextPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: contexts, error } = await supabase
    .from('business_context')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
  
  if (error) {
    console.error('Error fetching business context:', error)
  }
  
  const context = contexts?.[0] || null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Context</h1>
        <p className="text-gray-600">
          Help the AI understand your business better by providing context
        </p>
      </div>

      <ContextForm initialContext={context} />
    </div>
  )
}