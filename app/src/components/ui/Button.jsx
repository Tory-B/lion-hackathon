import { forwardRef } from 'react'

const VARIANTS = {
  primary: 'bg-brand-600 text-white border border-brand-600 hover:bg-brand-700',
  dark: 'bg-ink-900 text-white border border-ink-900 hover:bg-black',
  secondary: 'bg-white text-[#14181a] border border-[#d8ddda] hover:bg-[#f4f6f5]',
  link: 'bg-transparent text-brand-700 underline hover:text-brand-800 border-0 px-0',
}

const Button = forwardRef(function Button(
  { variant = 'primary', className = '', children, ...props },
  ref,
) {
  const base =
    variant === 'link'
      ? 'text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed'
      : 'rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  return (
    <button ref={ref} className={`${base} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
})

export default Button
