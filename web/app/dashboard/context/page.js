import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ContextForm } from '@/components/context/ContextForm'
import { redirect } from 'next/navigation'

export default async function ContextPage() {
  try {
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
      // Don't crash, just show the form with empty data
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Context</h1>
            <p className="text-gray-600">
              Help the AI understand your business better by providing context
            </p>
          </div>

          <ContextForm initialContext={null} />
        </div>
      )
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
  } catch (error) {
    console.error('Unexpected error in ContextPage:', error)
    // Return a basic error UI instead of crashing
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Context</h1>
          <p className="text-red-600">
            There was an error loading your business context. Please try refreshing the page.
          </p>
        </div>
      </div>
    )
  }
}