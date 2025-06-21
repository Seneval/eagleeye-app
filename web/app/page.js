import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="container-max py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            EagleEye
          </h1>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-max py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-5xl font-bold text-gray-900">
            Smart Productivity for Growing Businesses
          </h2>
          <p className="text-xl text-gray-600">
            AI-powered task management and business insights designed for SME owners and freelancers. 
            Focus on what matters most.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/auth/signup">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link href="#features">
              <Button variant="secondary" size="lg">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="container-max">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to stay productive
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎯"
              title="AI Task Prioritization"
              description="Our AI analyzes your tasks and goals to suggest what to focus on next"
            />
            <FeatureCard
              icon="📊"
              title="Goal Tracking"
              description="Set and track weekly and monthly business goals with visual progress"
            />
            <FeatureCard
              icon="💬"
              title="Smart Assistants"
              description="Get expert advice from specialized AI bots for marketing and business strategy"
            />
            <FeatureCard
              icon="📈"
              title="Business Insights"
              description="Understand your productivity patterns and optimize your workflow"
            />
            <FeatureCard
              icon="🔄"
              title="Context Aware"
              description="AI that understands your business context for personalized recommendations"
            />
            <FeatureCard
              icon="🚀"
              title="Quick Actions"
              description="Streamlined interface designed for speed and efficiency"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-max py-20">
        <Card className="text-center py-12 px-8 bg-blue-50 border-blue-200">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to boost your productivity?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of business owners who are already using EagleEye to manage their tasks 
            and achieve their goals faster.
          </p>
          <Link href="/auth/signup">
            <Button size="lg">Start Your Free Trial</Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container-max py-8">
          <p className="text-center text-gray-600">
            © 2024 EagleEye. Built for entrepreneurs, by entrepreneurs.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card hover>
      <div className="text-3xl mb-4">{icon}</div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </Card>
  )
}