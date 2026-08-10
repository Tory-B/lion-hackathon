export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white border border-[#d0d0d0] rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-4 sm:p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
