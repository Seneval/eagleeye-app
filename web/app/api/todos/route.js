import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { withRateLimit, rateLimiters } from '@/lib/rate-limit'
import { apiLogger } from '@/lib/logger'

async function handleGET(request) {
  const timer = apiLogger.startTimer('GET /api/todos')
  
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      apiLogger.warn('Unauthorized access attempt to GET /api/todos')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    apiLogger.info('Fetching todos', { userId: user.id, date })

    const { data, error } = await supabase
      .from('daily_todos')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .order('position')

    if (error) throw error

    timer.end({ count: data.length })
    return NextResponse.json(data)
  } catch (error) {
    apiLogger.error('Error fetching todos', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handlePOST(request) {
  const timer = apiLogger.startTimer('POST /api/todos')
  
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.id) {
      apiLogger.warn('Unauthorized access attempt to POST /api/todos')
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { title, priority = 'medium', date = new Date().toISOString().split('T')[0] } = body

    apiLogger.info('Creating todo', { userId: user.id, title, priority, date })

    // Get the max position for today's todos
    const { data: existingTodos } = await supabase
      .from('daily_todos')
      .select('position')
      .eq('user_id', user.id)
      .eq('date', date)
      .order('position', { ascending: false })
      .limit(1)

    const nextPosition = existingTodos?.[0]?.position ? existingTodos[0].position + 1 : 0

    const { data, error } = await supabase
      .from('daily_todos')
      .insert({
        title,
        priority,
        date,
        user_id: user.id,
        position: nextPosition
      })
      .select()

    if (error) {
      apiLogger.error('Database error creating todo', error)
      throw error
    }

    const newTodo = data?.[0]
    if (!newTodo) {
      throw new Error('Todo was not created')
    }

    apiLogger.trackAction('todo_created', { 
      todoId: newTodo.id, 
      priority: newTodo.priority 
    })
    
    timer.end({ todoId: newTodo.id })
    return NextResponse.json(newTodo)
  } catch (error) {
    apiLogger.error('Error in POST /api/todos', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handlePATCH(request) {
  const timer = apiLogger.startTimer('PATCH /api/todos')
  
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.id) {
      apiLogger.warn('Unauthorized access attempt to PATCH /api/todos')
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    apiLogger.info('Updating todo', { userId: user.id, todoId: id, updates })

    const { data, error } = await supabase
      .from('daily_todos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()

    if (error) {
      apiLogger.error('Database error updating todo', error)
      throw error
    }

    const updatedTodo = data?.[0]
    if (!updatedTodo) {
      throw new Error('Todo not found or not updated')
    }

    // Track specific actions
    if (updates.completed !== undefined) {
      apiLogger.trackAction(updates.completed ? 'todo_completed' : 'todo_uncompleted', {
        todoId: id
      })
    }

    timer.end({ todoId: id })
    return NextResponse.json(updatedTodo)
  } catch (error) {
    apiLogger.error('Error in PATCH /api/todos', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Apply rate limiting to exports
export const GET = withRateLimit(handleGET, rateLimiters.api)
export const POST = withRateLimit(handlePOST, rateLimiters.api)
export const PATCH = withRateLimit(handlePATCH, rateLimiters.api)