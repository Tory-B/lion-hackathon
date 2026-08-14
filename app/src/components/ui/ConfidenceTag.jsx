const META = {
  CONFIRMED: { label: '실측', icon: '✓', className: 'text-brand-700 border-brand-200 bg-brand-50' },
  APPROXIMATE: { label: '추론', icon: '≈', className: 'text-amber-700 border-amber-200 bg-amber-50' },
  LOW_SAMPLE: { label: '표본 적음', icon: '!', className: 'text-amber-700 border-amber-200 bg-amber-50' },
  INSUFFICIENT_DATA: { label: '빈칸 · 설문 필요', icon: '×', className: 'text-[#8a938e] border-[#dfe4e1] bg-[#f4f6f5]' },
}

export default function ConfidenceTag({ status, className = '' }) {
  const meta = META[status] ?? META.CONFIRMED
  return (
    <span
      className={`inline-flex items-center gap-1 h-6 px-2 rounded-md border text-[11px] font-medium ${meta.className} ${className}`}
    >
      <span>{meta.icon}</span>
      {meta.label}
    </span>
  )
}
