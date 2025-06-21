'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function GoalForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'weekly',
    targetDate: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('business_goals')
        .insert({
          ...formData,
          target_date: formData.targetDate,
          user_id: user.id
        })

      if (error) throw error

      setFormData({
        title: '',
        description: '',
        type: 'weekly',
        targetDate: ''
      })
      router.refresh()
    } catch (error) {
      console.error('Error creating goal:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Calculate default dates
  const getDefaultDate = (type) => {
    const date = new Date()
    if (type === 'weekly') {
      date.setDate(date.getDate() + 7)
    } else {
      date.setMonth(date.getMonth() + 1)
    }
    return date.toISOString().split('T')[0]
  }

  return (
    <Card>
      <h3 className="text-xl font-semibold text-white mb-4">Create New Goal</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Goal Title"
            placeholder="e.g., Launch new product"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/90">
              Goal Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => {
                updateField('type', e.target.value)
                updateField('targetDate', getDefaultDate(e.target.value))
              }}
              className="w-full px-4 py-3 rounded-lg glass-dark text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="weekly">Weekly Goal</option>
              <option value="monthly">Monthly Goal</option>
            </select>
          </div>
        </div>

        <Input
          label="Description (optional)"
          placeholder="What does success look like?"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
        />

        <Input
          type="date"
          label="Target Date"
          value={formData.targetDate}
          onChange={(e) => updateField('targetDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
        />

        <Button 
          type="submit" 
          disabled={loading || !formData.title || !formData.targetDate}
          className="w-full md:w-auto"
        >
          {loading ? 'Creating...' : 'Create Goal'}
        </Button>
      </form>
    </Card>
  )
}