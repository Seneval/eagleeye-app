'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function TodoItem({ todo }) {
  const router = useRouter()
  const [isCompleting, setIsCompleting] = useState(false)

  const handleToggle = async () => {
    setIsCompleting(true)
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('daily_todos')
        .update({ 
          completed: !todo.completed,
          completed_at: !todo.completed ? new Date().toISOString() : null
        })
        .eq('id', todo.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error toggling todo:', error)
      setIsCompleting(false)
    }
  }

  const priorityStyles = {
    high: {
      badge: 'bg-red-100 text-red-800 border-red-200',
      checkbox: 'border-red-400 focus:ring-red-500'
    },
    medium: {
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      checkbox: 'border-yellow-400 focus:ring-yellow-500'
    },
    low: {
      badge: 'bg-green-100 text-green-800 border-green-200',
      checkbox: 'border-green-400 focus:ring-green-500'
    }
  }

  const styles = priorityStyles[todo.priority]

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-md
      bg-white border border-gray-200 hover:border-gray-300
      transition-all duration-150
      ${todo.completed ? 'opacity-60' : ''}
      ${isCompleting ? 'scale-98' : ''}
    `}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        className={`
          w-5 h-5 rounded cursor-pointer
          text-blue-600 focus:ring-2 focus:ring-offset-2
          ${todo.completed ? 'border-gray-300' : styles.checkbox}
        `}
        disabled={isCompleting}
      />

      <div className="flex-1 min-w-0">
        <p className={`text-gray-900 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
          {todo.title}
        </p>
        {todo.ai_suggestion && !todo.completed && (
          <p className="text-sm text-gray-500 mt-1">
            💡 {todo.ai_suggestion}
          </p>
        )}
      </div>

      <span className={`
        text-xs px-2 py-1 rounded-full border font-medium
        ${styles.badge}
      `}>
        {todo.priority}
      </span>
    </div>
  )
}