export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white border border-[#e2e6e3] rounded-xl shadow-[0_1px_2px_rgba(11,21,18,0.04)] p-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
