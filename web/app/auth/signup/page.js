'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    role: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      
      // Sign up the user
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            business_name: formData.businessName,
            role: formData.role
          }
        }
      })

      if (signupError) throw signupError

      // Update profile with additional info
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            business_name: formData.businessName,
            role: formData.role
          })
          .eq('id', data.user.id)

        if (profileError) console.error('Profile update error:', profileError)
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Started Free</h1>
            <p className="text-gray-700">Create your EagleEye account</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
            />

            <Input
              type="text"
              label="Business Name (optional)"
              placeholder="Acme Inc"
              value={formData.businessName}
              onChange={(e) => updateField('businessName', e.target.value)}
            />

            <Input
              type="text"
              label="Your Role"
              placeholder="Founder, Freelancer, etc."
              value={formData.role}
              onChange={(e) => updateField('role', e.target.value)}
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-center">
              <Link 
                href="/auth/login" 
                className="text-accent hover:text-accent/80 text-sm"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}