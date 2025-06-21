import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/ai/ChatInterface'
import { bots } from '@/lib/ai/bots'

export default async function AssistantPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">AI Assistant</h1>
        <p className="text-white/60">
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