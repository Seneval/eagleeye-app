'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import * as Sentry from '@sentry/nextjs'

export default function TestSentryPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const addResult = (result) => {
    setResults(prev => [{
      ...result,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev])
  }

  const testClientError = () => {
    try {
      throw new Error('Test client-side error for Sentry')
    } catch (error) {
      Sentry.captureException(error)
      addResult({
        type: 'Client Error',
        status: 'Sent',
        message: error.message
      })
    }
  }

  const testClientMessage = () => {
    Sentry.captureMessage('Test message from client', 'info')
    addResult({
      type: 'Client Message',
      status: 'Sent',
      message: 'Test message from client'
    })
  }

  const testApiError = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-sentry?type=error')
      const data = await response.json()
      addResult({
        type: 'API Error Test',
        status: response.ok ? 'Success' : 'Error',
        message: data.message || data.error
      })
    } catch (error) {
      addResult({
        type: 'API Error Test',
        status: 'Failed',
        message: error.message
      })
    }
    setLoading(false)
  }

  const testApiMessage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-sentry?type=test')
      const data = await response.json()
      addResult({
        type: 'API Message Test',
        status: 'Success',
        message: data.message
      })
    } catch (error) {
      addResult({
        type: 'API Message Test',
        status: 'Failed',
        message: error.message
      })
    }
    setLoading(false)
  }

  const testUserContext = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-sentry?type=user')
      const data = await response.json()
      addResult({
        type: 'User Context Test',
        status: 'Success',
        message: data.message
      })
    } catch (error) {
      addResult({
        type: 'User Context Test',
        status: 'Failed',
        message: error.message
      })
    }
    setLoading(false)
  }

  const testPerformance = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-sentry?type=performance')
      const data = await response.json()
      addResult({
        type: 'Performance Test',
        status: 'Success',
        message: data.message
      })
    } catch (error) {
      addResult({
        type: 'Performance Test',
        status: 'Failed',
        message: error.message
      })
    }
    setLoading(false)
  }

  const testUnhandledRejection = () => {
    // This will trigger the global error handler
    setTimeout(() => {
      Promise.reject(new Error('Test unhandled promise rejection'))
    }, 100)
    
    addResult({
      type: 'Unhandled Rejection',
      status: 'Triggered',
      message: 'Check Sentry for unhandled promise rejection'
    })
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Sentry Integration</h1>
        <p className="text-gray-600">
          Use these buttons to verify Sentry is capturing errors correctly
        </p>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Client-Side Tests</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={testClientError}
            variant="primary"
            disabled={loading}
          >
            Trigger Client Error
          </Button>
          <Button
            onClick={testClientMessage}
            variant="secondary"
            disabled={loading}
          >
            Send Client Message
          </Button>
          <Button
            onClick={testUnhandledRejection}
            variant="secondary"
            disabled={loading}
          >
            Trigger Unhandled Rejection
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">API Tests</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={testApiError}
            variant="primary"
            disabled={loading}
          >
            Test API Error
          </Button>
          <Button
            onClick={testApiMessage}
            variant="secondary"
            disabled={loading}
          >
            Test API Message
          </Button>
          <Button
            onClick={testUserContext}
            variant="secondary"
            disabled={loading}
          >
            Test User Context
          </Button>
          <Button
            onClick={testPerformance}
            variant="secondary"
            disabled={loading}
          >
            Test Performance
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          <Button
            onClick={clearResults}
            variant="ghost"
            size="sm"
            disabled={results.length === 0}
          >
            Clear
          </Button>
        </div>
        
        {results.length === 0 ? (
          <p className="text-gray-500">No tests run yet</p>
        ) : (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{result.type}</p>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      result.status === 'Success' || result.status === 'Sent' ? 'text-green-600' : 
                      result.status === 'Failed' ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>
                      {result.status}
                    </span>
                    <p className="text-xs text-gray-400">{result.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
          <li>Run any of the tests above</li>
          <li>Go to your Sentry dashboard: <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="underline">sentry.io</a></li>
          <li>Check the Issues tab for errors</li>
          <li>Check the Performance tab for transactions</li>
          <li>Verify user context is attached to events</li>
        </ol>
      </Card>
    </div>
  )
}