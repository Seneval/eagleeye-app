export function BotAvatar({ bot, size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8 text-2xl',
    md: 'w-12 h-12 text-3xl',
    lg: 'w-16 h-16 text-4xl'
  }

  return (
    <div className={`
      ${sizes[size]}
      rounded-full glass flex items-center justify-center
      animate-pulse-slow
    `}>
      {bot.avatar}
    </div>
  )
}