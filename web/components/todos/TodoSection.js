'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { TodoItem } from './TodoItem'

export function TodoSection({ title, todos: initialTodos, showCompleted = true, className = '' }) {
  const [todos, setTodos] = useState(initialTodos)
  
  // Update local state when props change
  useEffect(() => {
    setTodos(initialTodos)
  }, [initialTodos])

  const incompleteTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)

  if (todos.length === 0 && !showCompleted) {
    return null
  }

  return (
    <Card className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="space-y-2">
        {incompleteTodos.length === 0 && completedTodos.length === 0 && (
          <p className="text-gray-500 text-center py-4 text-sm">
            No tasks in this section
          </p>
        )}

        {incompleteTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}

        {showCompleted && completedTodos.length > 0 && (
          <>
            <div className="border-t border-gray-200 my-4" />
            <p className="text-sm font-medium text-gray-500 mb-2">Completed</p>
            <div className="space-y-2 opacity-60">
              {completedTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  )
}