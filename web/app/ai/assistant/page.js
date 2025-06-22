import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/ai/ChatInterface'
import { bots } from '@/lib/ai/bots'
import { redirect } from 'next/navigation'
import { BackButton } from '@/components/ui/BackButton'

export const dynamic = 'force-dynamic'

export default async function AssistantPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch existing chat
  const { data: chat } = await supabase
    .from('ai_chats')
    .select('*')
    .eq('user_id', user.id)
    .eq('bot_type', 'assistant')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <BackButton href="/dashboard">Back to Dashboard</BackButton>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Assistant</h1>
        <p className="text-gray-600">
          Get personalized productivity advice based on your tasks and goals
        </p>
      </div>

      <ChatInterface 
        bot={bots.assistant}
        initialMessages={chat?.messages || []}
      />
    </div>
  )
}