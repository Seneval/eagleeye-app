import { Card } from '@/components/ui/Card'

export function DailyStats({ todos }) {
  const completed = todos?.filter(t => t.completed).length || 0
  const total = todos?.length || 0
  const highPriority = todos?.filter(t => t.priority === 'high' && !t.completed).length || 0
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const stats = [
    {
      label: 'Total Tasks',
      value: total,
      icon: '📋',
      color: 'text-gray-900'
    },
    {
      label: 'Completed',
      value: completed,
      icon: '✅',
      color: 'text-green-600'
    },
    {
      label: 'High Priority',
      value: highPriority,
      icon: '🔥',
      color: 'text-red-600'
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: '📊',
      color: 'text-blue-600'
    }
  ]

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.label}
                </dt>
                <dd className={`text-2xl font-semibold ${stat.color}`}>
                  {stat.value}
                </dd>
              </dl>
            </div>
          </div>
        </Card>
      ))}
    </>
  )
}