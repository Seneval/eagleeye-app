import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { bots } from '@/lib/ai/bots'
import { getContextPrompt } from '@/lib/ai/prompts'
import { checkAIBotLimit, incrementAIBotUsage } from '@/lib/ai/rate-limit'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api.ai')

export async function POST(request, { params }) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await request.json()
    const { bot: botId } = await params

    if (!bots[botId]) {
      return NextResponse.json({ error: 'Invalid bot' }, { status: 400 })
    }

    // Get user's subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .limit(1)

    const subscriptionTier = profile?.[0]?.subscription_tier || 'free'

    // Check daily rate limit
    const limitCheck = await checkAIBotLimit(user.id, botId, subscriptionTier)
    
    if (!limitCheck.allowed) {
      logger.warn('AI bot daily limit exceeded', {
        userId: user.id,
        botType: botId,
        limit: limitCheck.limit,
        currentUsage: limitCheck.currentUsage
      })

      return NextResponse.json({
        error: 'Daily limit reached',
        message: `You've reached your daily limit of ${limitCheck.limit} messages for this AI assistant. Your limit will reset at midnight. Upgrade to premium for ${limitCheck.limit * 10} daily messages!`,
        limitInfo: {
          limit: limitCheck.limit,
          remaining: 0,
          resetAt: limitCheck.resetAt,
          tier: subscriptionTier
        }
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limitCheck.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': limitCheck.resetAt
        }
      })
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

    // Increment usage count
    await incrementAIBotUsage(user.id, botId)

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

    // Return response with rate limit info
    return NextResponse.json({ 
      message: aiResponse,
      limitInfo: {
        limit: limitCheck.limit,
        remaining: limitCheck.remaining - 1,
        resetAt: limitCheck.resetAt,
        tier: subscriptionTier
      }
    }, {
      headers: {
        'X-RateLimit-Limit': String(limitCheck.limit),
        'X-RateLimit-Remaining': String(Math.max(0, limitCheck.remaining - 1)),
        'X-RateLimit-Reset': limitCheck.resetAt
      }
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}