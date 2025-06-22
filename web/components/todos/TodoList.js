'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { TodoItem } from './TodoItem'

export function TodoList({ todos: initialTodos }) {
  const [todos, setTodos] = useState(initialTodos)
  
  // Update local state when props change
  useEffect(() => {
    setTodos(initialTodos)
  }, [initialTodos])

  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('todoIndex', index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('todoIndex'))
    
    if (dragIndex === dropIndex) return

    const draggedTodo = todos[dragIndex]
    const newTodos = [...todos]
    newTodos.splice(dragIndex, 1)
    newTodos.splice(dropIndex, 0, draggedTodo)
    
    setTodos(newTodos)
    // TODO: Update positions in database
  }

  const incompleteTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Tasks</h3>
      
      <div className="space-y-2">
        {incompleteTodos.length === 0 && completedTodos.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No tasks yet. Add one above to get started!
          </p>
        )}

        {incompleteTodos.map((todo, index) => (
          <div
            key={todo.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className="cursor-move"
          >
            <TodoItem todo={todo} />
          </div>
        ))}

        {completedTodos.length > 0 && (
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