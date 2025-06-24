import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('ai-rate-limit')

// Daily limits per bot type
export const AI_DAILY_LIMITS = {
  free: 10,      // 10 requests per day for free tier
  premium: 100   // 100 requests per day for premium tier
}

/**
 * Check if user has reached their daily AI bot limit
 * @param {string} userId - User ID
 * @param {string} botType - Bot type (assistant, marketing, ads, design, accounting)
 * @param {string} subscriptionTier - User's subscription tier (free, premium)
 * @returns {Object} { allowed: boolean, remaining: number, limit: number, resetAt: string }
 */
export async function checkAIBotLimit(userId, botType, subscriptionTier = 'free') {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const limit = AI_DAILY_LIMITS[subscriptionTier] || AI_DAILY_LIMITS.free

  try {
    // Get or create today's usage record
    let { data: usage, error } = await supabase
      .from('ai_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('bot_type', botType)
      .eq('date', today)
      .limit(1)

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    // If no usage record exists, create one
    if (!usage || usage.length === 0) {
      const { data: newUsage, error: insertError } = await supabase
        .from('ai_usage')
        .insert({
          user_id: userId,
          bot_type: botType,
          date: today,
          request_count: 0
        })
        .select()
        .single()

      if (insertError) {
        // Handle unique constraint violation (race condition)
        if (insertError.code === '23505') {
          // Retry the select
          const { data: retryUsage } = await supabase
            .from('ai_usage')
            .select('*')
            .eq('user_id', userId)
            .eq('bot_type', botType)
            .eq('date', today)
            .limit(1)
          
          usage = retryUsage
        } else {
          throw insertError
        }
      } else {
        usage = [newUsage]
      }
    }

    const currentUsage = usage[0] || { request_count: 0 }
    const remaining = Math.max(0, limit - currentUsage.request_count)
    const allowed = remaining > 0

    // Calculate reset time (midnight local time)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    logger.info('AI bot limit check', {
      userId,
      botType,
      currentUsage: currentUsage.request_count,
      limit,
      remaining,
      allowed
    })

    return {
      allowed,
      remaining,
      limit,
      resetAt: tomorrow.toISOString(),
      currentUsage: currentUsage.request_count
    }
  } catch (error) {
    logger.error('Error checking AI bot limit', {
      error: error.message,
      userId,
      botType
    })
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: limit,
      limit,
      resetAt: new Date().toISOString(),
      currentUsage: 0
    }
  }
}

/**
 * Increment the usage count for an AI bot
 * @param {string} userId - User ID
 * @param {string} botType - Bot type
 * @returns {Object} Updated usage info
 */
export async function incrementAIBotUsage(userId, botType) {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  try {
    // First try to use the RPC function which handles everything
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('increment_ai_usage', {
        p_user_id: userId,
        p_bot_type: botType,
        p_date: today
      })

    if (rpcError) {
      // If RPC fails, try to create the record first
      if (rpcError.code === 'PGRST202') {
        // Record doesn't exist, create it
        const { error: insertError } = await supabase
          .from('ai_usage')
          .insert({
            user_id: userId,
            bot_type: botType,
            date: today,
            request_count: 1
          })

        if (insertError && insertError.code !== '23505') {
          // If not a duplicate key error, throw it
          throw insertError
        }
        
        // If it was a duplicate key error, try RPC again
        if (insertError && insertError.code === '23505') {
          const { error: retryError } = await supabase
            .rpc('increment_ai_usage', {
              p_user_id: userId,
              p_bot_type: botType,
              p_date: today
            })
          
          if (retryError) throw retryError
        }
      } else {
        throw rpcError
      }
    }

    logger.info('AI bot usage incremented', {
      userId,
      botType,
      date: today,
      newCount: rpcResult
    })

    return { success: true, count: rpcResult }
  } catch (error) {
    logger.error('Error incrementing AI bot usage', {
      error: error.message,
      userId,
      botType
    })
    // Don't block the request on increment failure
    return { success: false, error: error.message }
  }
}

/**
 * Get usage stats for all bots for a user
 * @param {string} userId - User ID
 * @returns {Object} Usage stats by bot type
 */
export async function getAIUsageStats(userId, subscriptionTier = 'free') {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]
  const limit = AI_DAILY_LIMITS[subscriptionTier] || AI_DAILY_LIMITS.free

  try {
    const { data: usage, error } = await supabase
      .from('ai_usage')
      .select('bot_type, request_count')
      .eq('user_id', userId)
      .eq('date', today)

    if (error) throw error

    // Create stats object with all bot types
    const botTypes = ['assistant', 'marketing', 'ads', 'design', 'accounting']
    const stats = {}

    botTypes.forEach(botType => {
      const record = usage?.find(u => u.bot_type === botType)
      stats[botType] = {
        used: record?.request_count || 0,
        remaining: Math.max(0, limit - (record?.request_count || 0)),
        limit
      }
    })

    return stats
  } catch (error) {
    logger.error('Error getting AI usage stats', {
      error: error.message,
      userId
    })
    return null
  }
}