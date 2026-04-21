import { type InputHTMLAttributes } from 'react'
import clsx from 'clsx'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'w-full rounded-pill bg-input px-4 py-2.5 text-sm text-main shadow-insetSoft placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50',
        className,
      )}
      {...props}
    />
  )
}
