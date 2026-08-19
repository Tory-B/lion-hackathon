export default function Logo({ size = 48 }) {
  return (
    <span className="inline-flex items-center gap-2 text-[#14181a]">
      <span
        className="inline-block overflow-hidden rounded-full shrink-0"
        style={{ width: size, height: size }}
      >
        <img
          src="/icon.png"
          alt="suyo"
          className="w-full h-full object-cover scale-[1.35]"
        />
      </span>
      <span className="text-[22px] font-bold tracking-tight">suyo</span>
    </span>
  )
}
