'use client'

import { useEffect, useState } from 'react'

export function TimeGradient() {
  const [timeOfDay, setTimeOfDay] = useState('day')

  useEffect(() => {
    const updateGradient = () => {
      const hour = new Date().getHours()
      
      if (hour >= 5 && hour < 12) {
        setTimeOfDay('morning')
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay('afternoon')
      } else if (hour >= 17 && hour < 21) {
        setTimeOfDay('evening')
      } else {
        setTimeOfDay('night')
      }
    }

    updateGradient()
    const interval = setInterval(updateGradient, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const gradients = {
    morning: 'from-orange-400 via-pink-400 to-purple-400',
    afternoon: 'from-blue-400 via-purple-400 to-pink-400',
    evening: 'from-purple-500 via-pink-500 to-orange-500',
    night: 'from-purple-800 via-blue-800 to-indigo-800'
  }

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${gradients[timeOfDay]} opacity-90 animate-gradient`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  )
}