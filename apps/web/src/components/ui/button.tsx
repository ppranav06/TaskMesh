import { type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-pill px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        {
          'bg-primary text-white hover:shadow-soft': variant === 'primary',
          'bg-input text-main hover:bg-slate-200': variant === 'secondary',
          'bg-peach text-main hover:shadow-soft': variant === 'danger',
        },
        className,
      )}
      {...props}
    />
  )
}
