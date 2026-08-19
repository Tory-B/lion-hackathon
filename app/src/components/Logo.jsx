export default function Logo({ size = 22 }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#14181a]">
      <span
        className="inline-block overflow-hidden rounded-full shrink-0"
        style={{ width: size, height: size }}
      >
        <img
          src="/icon.jpg"
          alt="suyo"
          className="w-full h-full object-cover scale-[1.35]"
        />
      </span>
      <span className="text-[19px] font-bold tracking-tight">suyo</span>
    </span>
  )
}
