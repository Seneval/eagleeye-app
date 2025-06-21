'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TodoList } from '@/components/todos/TodoList'
import { TodoQuickAdd } from '@/components/todos/TodoQuickAdd'
import { PriorityCompass } from '@/components/PriorityCompass'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function TodosPage() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTodos()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('todos-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'daily_todos' },
        handleRealtimeUpdate
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchTodos = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('daily_todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRealtimeUpdate = (payload) => {
    if (payload.eventType === 'INSERT') {
      setTodos(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setTodos(prev => prev.map(todo => 
        todo.id === payload.new.id ? payload.new : todo
      ))
    } else if (payload.eventType === 'DELETE') {
      setTodos(prev => prev.filter(todo => todo.id !== payload.old.id))
    }
  }

  const addTodo = async (title) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('daily_todos')
        .insert({
          user_id: user.id,
          title,
          status: 'pending',
          priority: 'medium'
        })

      if (error) throw error
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  const updateTodo = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('daily_todos')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase
        .from('daily_todos')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const prioritizeTodos = async () => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todos })
      })

      if (!response.ok) throw new Error('Failed to prioritize')

      const { prioritizedTodos } = await response.json()
      
      // Update todos with new priorities
      for (const todo of prioritizedTodos) {
        await updateTodo(todo.id, { 
          priority: todo.priority,
          ai_notes: todo.reasoning 
        })
      }
    } catch (error) {
      console.error('Error prioritizing todos:', error)
    }
  }

  const pendingTodos = todos.filter(t => t.status === 'pending')
  const completedTodos = todos.filter(t => t.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Daily Tasks</h1>
        <Button 
          onClick={prioritizeTodos}
          variant="secondary"
          disabled={pendingTodos.length === 0}
        >
          AI Prioritize
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodoQuickAdd onAdd={addTodo} />
          
          <Card>
            <h2 className="text-lg font-semibold mb-4">Active Tasks</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading tasks...</div>
            ) : pendingTodos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tasks yet. Add one above to get started!
              </div>
            ) : (
              <TodoList
                todos={pendingTodos}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
              />
            )}
          </Card>

          {completedTodos.length > 0 && (
            <Card className="opacity-75">
              <h2 className="text-lg font-semibold mb-4 text-gray-600">
                Completed ({completedTodos.length})
              </h2>
              <TodoList
                todos={completedTodos}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
              />
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <PriorityCompass todos={pendingTodos} />
          
          <Card>
            <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total tasks:</span>
                <span className="font-medium">{todos.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium text-green-600">{completedTodos.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-medium text-blue-600">{pendingTodos.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}