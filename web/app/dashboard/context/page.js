import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ContextForm } from '@/components/context/ContextForm'

export default async function ContextPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: context } = await supabase
    .from('business_context')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Business Context</h1>
        <p className="text-white/60">
          Help the AI understand your business better by providing context
        </p>
      </div>

      <ContextForm initialContext={context} />
    </div>
  )
}