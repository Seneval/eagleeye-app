export async function getContextPrompt(supabase, userId) {
  // Fetch user's current context
  const [
    { data: todos },
    { data: goals },
    { data: context }
  ] = await Promise.all([
    supabase
      .from('daily_todos')
      .select('*')
      .eq('user_id', userId)
      .eq('date', new Date().toISOString().split('T')[0])
      .eq('completed', false),
    supabase
      .from('business_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active'),
    supabase
      .from('business_context')
      .select('*')
      .eq('user_id', userId)
      .single()
  ])

  let contextPrompt = '\n\nCurrent Context:\n'

  if (todos && todos.length > 0) {
    contextPrompt += '\nToday\'s Tasks:\n'
    todos.forEach(todo => {
      contextPrompt += `- ${todo.title} (Priority: ${todo.priority})\n`
    })
  }

  if (goals && goals.length > 0) {
    contextPrompt += '\nActive Goals:\n'
    goals.forEach(goal => {
      const daysLeft = Math.ceil(
        (new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)
      )
      contextPrompt += `- ${goal.title} (${goal.type}, ${goal.progress}% complete, ${daysLeft} days left)\n`
    })
  }

  if (context) {
    contextPrompt += '\nBusiness Context:\n'
    if (context.target_market) {
      contextPrompt += `Target Market: ${context.target_market}\n`
    }
    if (context.challenges?.length > 0) {
      contextPrompt += `Challenges: ${context.challenges.join(', ')}\n`
    }
    if (context.strengths?.length > 0) {
      contextPrompt += `Strengths: ${context.strengths.join(', ')}\n`
    }
  }

  return contextPrompt
}