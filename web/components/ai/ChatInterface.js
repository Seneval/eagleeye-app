'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BotAvatar } from './BotAvatar'

export function ChatInterface({ bot, initialMessages = [], initialLimitInfo = null }) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [limitInfo, setLimitInfo] = useState(initialLimitInfo)
  const [rateLimitError, setRateLimitError] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input.trim() }
    const userInput = input // Save input before clearing
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(`/api/ai/${bot.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      })

      const data = await response.json()
      
      if (response.status === 429) {
        // Rate limit exceeded
        setRateLimitError(data.message)
        setInput(userInput) // Restore the input so user can see what they tried to send
        // Don't add any messages to the chat
        return
      }
      
      // Only add user message if request was successful
      setMessages(prev => [...prev, userMessage])
      
      if (data.error) throw new Error(data.error)

      // Update limit info if provided
      if (data.limitInfo) {
        setLimitInfo(data.limitInfo)
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message 
      }])
      setRateLimitError(null)
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <BotAvatar bot={bot} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{bot.name}</h3>
            <p className="text-sm text-gray-600">{bot.description}</p>
          </div>
        </div>
        
        {limitInfo && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              Daily Messages
            </p>
            <p className="text-xs text-gray-500">
              {limitInfo.limit - limitInfo.remaining}/{limitInfo.limit} used
            </p>
            {limitInfo.tier === 'free' && limitInfo.remaining <= 3 && limitInfo.remaining > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                {limitInfo.remaining} left today
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg mb-2">Hi! I'm {bot.name} {bot.avatar}</p>
            <p>{bot.personality}</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && <BotAvatar bot={bot} size="sm" />}
            
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <BotAvatar bot={bot} size="sm" />
            <div className="glass p-3 rounded-lg">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {(rateLimitError || (limitInfo && limitInfo.remaining === 0)) && (
        <div className="mx-4 mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            {rateLimitError || `You've reached your daily limit of ${limitInfo.limit} messages for this AI assistant. Your limit will reset at midnight. Upgrade to premium for ${limitInfo.limit * 10} daily messages!`}
          </p>
          <div className="mt-2 flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.location.href = '/pricing'}
            >
              Upgrade to Premium
            </Button>
            {rateLimitError && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setRateLimitError(null)}
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={limitInfo && limitInfo.remaining === 0 ? "Daily limit reached - Upgrade to continue" : "Type your message..."}
            className={`flex-1 px-4 py-2 rounded-lg border ${
              limitInfo && limitInfo.remaining === 0 
                ? 'bg-gray-100 border-gray-300 text-gray-500' 
                : 'bg-gray-50 border-gray-200 text-gray-900'
            } placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent`}
            disabled={loading || (limitInfo && limitInfo.remaining === 0)}
          />
          <Button 
            type="submit" 
            disabled={loading || !input.trim() || (limitInfo && limitInfo.remaining === 0)}
          >
            Send
          </Button>
        </div>
      </form>
    </Card>
  )
}