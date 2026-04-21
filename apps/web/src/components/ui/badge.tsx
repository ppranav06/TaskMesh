import clsx from 'clsx'

type Tone = 'default' | 'mint' | 'peach' | 'lavender'

export function Badge({
  label,
  tone = 'default',
}: {
  label: string
  tone?: Tone
}) {
  return (
    <span
      className={clsx(
        'inline-flex rounded-pill px-2.5 py-1 text-xs font-bold uppercase tracking-wide',
        {
          'bg-input text-main': tone === 'default',
          'bg-mint text-main': tone === 'mint',
          'bg-peach text-main': tone === 'peach',
          'bg-indigo-100 text-indigo-700': tone === 'lavender',
        },
      )}
    >
      {label}
    </span>
  )
}
