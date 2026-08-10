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
      className={`w-full rounded-md border px-3 py-2.5 text-sm text-[#333] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#333]/20 ${
        error ? 'border-red-400' : 'border-[#d0d0d0]'
      } ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', error, ...props }) {
  return (
    <textarea
      className={`w-full rounded-md border px-3 py-2.5 text-sm text-[#333] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#333]/20 min-h-[88px] ${
        error ? 'border-red-400' : 'border-[#d0d0d0]'
      } ${className}`}
      {...props}
    />
  )
}

export function FieldError({ children }) {
  if (!children) return null
  return <p className="mt-1 text-[12px] text-red-500">{children}</p>
}
