'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/todos', label: 'Tasks', icon: '✓' },
  { href: '/dashboard/goals', label: 'Goals', icon: '🎯' },
  { href: '/dashboard/context', label: 'Business Info', icon: '💼' },
]

const aiItems = [
  { href: '/ai/assistant', label: 'AI Assistant', icon: '🤖' },
  { href: '/ai/marketing', label: 'Marketing Bot', icon: '📢' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          EagleEye
        </h2>
      </div>

      <nav className="px-4 pb-6">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md
                  text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 -ml-4 pl-7' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            AI Tools
          </h3>
          <div className="mt-3 space-y-1">
            {aiItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md
                    text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 -ml-4 pl-7' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="px-3">
            <p className="text-sm text-gray-500">Free Plan</p>
            <Link 
              href="/upgrade" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Upgrade to Pro →
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  )
}