import { Card } from '@/components/ui/Card'

export function PriorityOverview({ todos }) {
  const incompleteTodos = todos?.filter(t => !t.completed) || []
  
  const priorityGroups = {
    high: incompleteTodos.filter(t => t.priority === 'high'),
    medium: incompleteTodos.filter(t => t.priority === 'medium'),
    low: incompleteTodos.filter(t => t.priority === 'low')
  }

  const priorityConfig = {
    high: { label: 'High Priority', color: 'bg-red-100 text-red-800 border-red-200' },
    medium: { label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    low: { label: 'Low Priority', color: 'bg-green-100 text-green-800 border-green-200' }
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Overview</h3>
      
      <div className="space-y-3">
        {['high', 'medium', 'low'].map(priority => {
          const tasks = priorityGroups[priority]
          const config = priorityConfig[priority]
          
          return (
            <div key={priority}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{config.label}</span>
                <span className={`text-xs px-2 py-1 rounded-full border ${config.color}`}>
                  {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {tasks.length > 0 && (
                <div className="space-y-1">
                  {tasks.slice(0, 3).map(task => (
                    <div key={task.id} className="text-sm text-gray-600 truncate pl-4">
                      • {task.title}
                    </div>
                  ))}
                  {tasks.length > 3 && (
                    <div className="text-sm text-gray-400 pl-4">
                      +{tasks.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        
        {incompleteTodos.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No pending tasks. Great job!
          </p>
        )}
      </div>
    </Card>
  )
}