import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'EagleEye - Smart Productivity for SMEs',
  description: 'AI-powered productivity assistant for small business owners and freelancers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#FAFAFA]`}>
        {children}
      </body>
    </html>
  )
}