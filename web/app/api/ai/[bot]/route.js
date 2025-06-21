import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { bots } from '@/lib/ai/bots'
import { getContextPrompt } from '@/lib/ai/prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request, { params }) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await request.json()
    const botId = params.bot

    if (!bots[botId]) {
      return NextResponse.json({ error: 'Invalid bot' }, { status: 400 })
    }

    const bot = bots[botId]

    // Get user context
    const contextPrompt = await getContextPrompt(supabase, user.id)

    // Get chat history
    const { data: chat } = await supabase
      .from('ai_chats')
      .select('*')
      .eq('user_id', user.id)
      .eq('bot_type', botId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const messages = [
      { role: 'system', content: bot.systemPrompt + contextPrompt },
      ...(chat?.messages || []),
      { role: 'user', content: message }
    ]

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const aiResponse = completion.choices[0].message.content

    // Update chat history
    const updatedMessages = [
      ...(chat?.messages || []),
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    ]

    if (chat) {
      await supabase
        .from('ai_chats')
        .update({ messages: updatedMessages })
        .eq('id', chat.id)
    } else {
      await supabase
        .from('ai_chats')
        .insert({
          user_id: user.id,
          bot_type: botId,
          messages: updatedMessages
        })
    }

    return NextResponse.json({ message: aiResponse })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}