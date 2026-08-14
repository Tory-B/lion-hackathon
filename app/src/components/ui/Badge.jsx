const TONES = {
  neutral: 'bg-[#f2f4f3] text-[#4b5450] border-transparent',
  brand: 'bg-brand-50 text-brand-700 border-transparent',
  dark: 'bg-ink-900 text-white border-transparent',
  outline: 'bg-transparent text-[#333] border-[#d8ddda]',
  danger: 'bg-red-50 text-red-600 border-transparent',
  warning: 'bg-amber-50 text-amber-700 border-transparent',
}

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center h-6 px-2.5 rounded-full border text-[12px] font-medium whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
