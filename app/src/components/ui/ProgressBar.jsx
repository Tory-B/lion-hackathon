export default function ProgressBar({ percent = 0, tone = 'brand', className = '' }) {
  const clamped = Math.max(0, Math.min(100, percent))
  const fill = tone === 'brand' ? 'bg-brand-500' : tone === 'dark' ? 'bg-ink-900' : 'bg-[#333]'
  return (
    <div className={`h-2 rounded-full bg-[#e8ebe9] overflow-hidden ${className}`}>
      <div className={`h-full rounded-full ${fill} transition-all duration-500`} style={{ width: `${clamped}%` }} />
    </div>
  )
}
