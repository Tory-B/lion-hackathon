export default function Badge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center h-7 px-3 rounded-full border border-[rgba(46,44,42,0.15)] text-[13px] text-[#333] whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  )
}
