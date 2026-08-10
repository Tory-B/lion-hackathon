export default function ProgressBar({ percent = 0, className = '' }) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className={`h-2.5 rounded-full bg-[#e8e8e8] overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-[#333] transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
