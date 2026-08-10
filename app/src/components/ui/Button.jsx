import { forwardRef } from 'react'

const VARIANTS = {
  primary: 'bg-[#262626] text-white border border-[#262626] hover:bg-black',
  secondary: 'bg-[rgba(46,44,42,0.06)] text-[#333] border border-[rgba(46,44,42,0.25)] hover:bg-[rgba(46,44,42,0.1)]',
  link: 'bg-transparent text-[#666] underline hover:text-[#333] border-0 px-0',
}

const Button = forwardRef(function Button(
  { variant = 'primary', className = '', children, ...props },
  ref,
) {
  const base =
    variant === 'link'
      ? 'text-sm font-normal disabled:opacity-40 disabled:cursor-not-allowed'
      : 'rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  return (
    <button ref={ref} className={`${base} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
})

export default Button
