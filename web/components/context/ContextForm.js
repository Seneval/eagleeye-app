'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ContextForm({ initialContext }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  
  const [formData, setFormData] = useState({
    targetMarket: initialContext?.target_market || '',
    challenges: initialContext?.challenges || [],
    strengths: initialContext?.strengths || [],
    competitors: initialContext?.competitors || [],
    personalGoals: initialContext?.personal_goals || []
  })

  // Auto-save with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (lastSaved !== JSON.stringify(formData)) {
        saveContext()
      }
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [formData])

  const saveContext = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const contextData = {
        target_market: formData.targetMarket,
        challenges: formData.challenges,
        strengths: formData.strengths,
        competitors: formData.competitors,
        personal_goals: formData.personalGoals,
        user_id: user.id
      }

      if (initialContext) {
        await supabase
          .from('business_context')
          .update(contextData)
          .eq('id', initialContext.id)
      } else {
        await supabase
          .from('business_context')
          .insert(contextData)
      }

      setLastSaved(JSON.stringify(formData))
      router.refresh()
    } catch (error) {
      console.error('Error saving context:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleArrayInput = (field, value, index) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData(prev => ({ ...prev, [field]: newArray }))
  }

  const addArrayItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }))
  }

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, [field]: newArray }))
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">About Your Business</h3>
          {saving && <span className="text-sm text-accent">Saving...</span>}
        </div>

        <div className="space-y-6">
          <Input
            label="Target Market"
            placeholder="Who are your ideal customers?"
            value={formData.targetMarket}
            onChange={(e) => setFormData(prev => ({ ...prev, targetMarket: e.target.value }))}
          />

          <ArrayInput
            label="Current Challenges"
            items={formData.challenges}
            placeholder="e.g., Finding new clients"
            onChange={(value, index) => handleArrayInput('challenges', value, index)}
            onAdd={() => addArrayItem('challenges')}
            onRemove={(index) => removeArrayItem('challenges', index)}
          />

          <ArrayInput
            label="Key Strengths"
            items={formData.strengths}
            placeholder="e.g., Fast delivery times"
            onChange={(value, index) => handleArrayInput('strengths', value, index)}
            onAdd={() => addArrayItem('strengths')}
            onRemove={(index) => removeArrayItem('strengths', index)}
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-white mb-4">Market & Goals</h3>

        <div className="space-y-6">
          <ArrayInput
            label="Main Competitors"
            items={formData.competitors}
            placeholder="e.g., Company X"
            onChange={(value, index) => handleArrayInput('competitors', value, index)}
            onAdd={() => addArrayItem('competitors')}
            onRemove={(index) => removeArrayItem('competitors', index)}
          />

          <ArrayInput
            label="Personal Goals"
            items={formData.personalGoals}
            placeholder="e.g., Work-life balance"
            onChange={(value, index) => handleArrayInput('personalGoals', value, index)}
            onAdd={() => addArrayItem('personalGoals')}
            onRemove={(index) => removeArrayItem('personalGoals', index)}
          />
        </div>
      </Card>
    </div>
  )
}

function ArrayInput({ label, items, placeholder, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/90">{label}</label>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(e.target.value, index)}
              placeholder={placeholder}
              className="flex-1 px-4 py-2 rounded-lg glass-dark text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={onAdd}
        className="w-full"
      >
        + Add {label.slice(0, -1)}
      </Button>
    </div>
  )
}