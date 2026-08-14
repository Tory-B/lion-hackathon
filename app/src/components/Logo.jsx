export default function Logo({ size = 22 }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#14181a]">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5l-8-3Z"
          fill="currentColor"
          className="text-brand-500"
        />
        <path d="M8 13.5 10.5 11l2 2L16 9" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[19px] font-bold tracking-tight">suyo</span>
    </span>
  )
}
