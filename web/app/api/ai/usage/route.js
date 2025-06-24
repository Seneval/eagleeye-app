import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAIUsageStats } from '@/lib/ai/rate-limit'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api.ai.usage')

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .limit(1)

    const subscriptionTier = profile?.[0]?.subscription_tier || 'free'

    // Get usage stats for all bots
    const stats = await getAIUsageStats(user.id, subscriptionTier)

    if (!stats) {
      return NextResponse.json({ error: 'Failed to fetch usage stats' }, { status: 500 })
    }

    logger.info('AI usage stats fetched', {
      userId: user.id,
      tier: subscriptionTier
    })

    return NextResponse.json({
      stats,
      tier: subscriptionTier
    })
  } catch (error) {
    logger.error('Error fetching AI usage stats', {
      error: error.message
    })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}