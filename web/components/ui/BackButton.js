'use client'

import { useRouter } from 'next/navigation'
import { Button } from './Button'

export function BackButton({ href, children = 'Back' }) {
  const router = useRouter()
  
  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }
  
  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      className="mb-4"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {children}
    </Button>
  )
}