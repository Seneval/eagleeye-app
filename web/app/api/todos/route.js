import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('daily_todos')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .order('position')

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.id) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Creating todo with data:', body)
    
    const { title, priority = 'medium', date = new Date().toISOString().split('T')[0] } = body

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
      console.error('Supabase error creating todo:', error)
      throw error
    }

    const newTodo = data?.[0]
    if (!newTodo) {
      throw new Error('Todo was not created')
    }

    return NextResponse.json(newTodo)
  } catch (error) {
    console.error('Error in POST /api/todos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.id) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    const { data, error } = await supabase
      .from('daily_todos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()

    if (error) {
      console.error('Supabase error updating todo:', error)
      throw error
    }

    const updatedTodo = data?.[0]
    if (!updatedTodo) {
      throw new Error('Todo not found or not updated')
    }

    return NextResponse.json(updatedTodo)
  } catch (error) {
    console.error('Error in PATCH /api/todos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}