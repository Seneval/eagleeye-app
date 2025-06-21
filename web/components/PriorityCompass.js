'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'

export function PriorityCompass({ todos = [] }) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    // Animate the compass needle
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360)
    }, 50)

    // Stop after finding priority
    setTimeout(() => {
      clearInterval(interval)
      // Point to the highest priority task
      const highPriorityCount = todos.filter(t => t.priority === 'high' && !t.completed).length
      const angle = highPriorityCount > 0 ? 45 : 180 // Point NE for high priority, S for normal
      setRotation(angle)
    }, 2000)

    return () => clearInterval(interval)
  }, [todos])

  const priorityTodos = todos
    .filter(t => !t.completed)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    .slice(0, 3)

  return (
    <Card className="relative overflow-hidden">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Priority Compass</h3>
      
      <div className="flex gap-8">
        <div className="relative w-32 h-32">
          {/* Compass Background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
          
          {/* Compass Circle */}
          <div className="absolute inset-2 rounded-full border-2 border-white/30" />
          
          {/* Cardinal Points */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="absolute top-0 text-gray-600 text-xs">HIGH</span>
            <span className="absolute right-0 text-gray-600 text-xs">MED</span>
            <span className="absolute bottom-0 text-gray-600 text-xs">LOW</span>
            <span className="absolute left-0 text-gray-600 text-xs">DONE</span>
          </div>
          
          {/* Compass Needle */}
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="w-1 h-12 bg-accent rounded-full relative">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent rounded-full" />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-3">Focus on these next:</p>
          <div className="space-y-2">
            {priorityTodos.map((todo, index) => (
              <div 
                key={todo.id} 
                className="flex items-center gap-2 text-sm"
              >
                <span className={`
                  w-2 h-2 rounded-full
                  ${todo.priority === 'high' ? 'bg-red-500' : 
                    todo.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}
                `} />
                <span className="text-gray-700 truncate">{todo.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}