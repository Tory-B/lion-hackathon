export function Label({ children, required }) {
  return (
    <label className="block text-sm font-medium text-[#333] mb-1.5">
      {children}
      {required && <span className="ml-1 text-[11px] text-[#999]">필수</span>}
    </label>
  )
}

export function Input({ className = '', error, ...props }) {
  return (
    <input
      className={`w-full rounded-lg border px-3 py-2.5 text-sm text-[#14181a] placeholder:text-[#9aa39e] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ${
        error ? 'border-red-400' : 'border-[#d8ddda]'
      } ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', error, ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border px-3 py-2.5 text-sm text-[#14181a] placeholder:text-[#9aa39e] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 min-h-[88px] ${
        error ? 'border-red-400' : 'border-[#d8ddda]'
      } ${className}`}
      {...props}
    />
  )
}

export function FieldError({ children }) {
  if (!children) return null
  return <p className="mt-1 text-[12px] text-red-500">{children}</p>
}
