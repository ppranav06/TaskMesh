import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAuth } from '../../context/auth-context'
import { http } from '../../lib/http/client'

interface FormValues {
  name: string
  password: string
}

export function UserSettingsPage() {
  const { user, refreshUser } = useAuth()

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      name: user?.name ?? '',
      password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload: Partial<FormValues> = {
        name: values.name,
      }

      if (values.password.trim()) {
        payload.password = values.password
      }

      await http.put('/users/me', payload)
    },
    onSuccess: async () => {
      await refreshUser()
    },
  })

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-main">User Settings</h1>
        <p className="mt-2 text-sm text-muted">Update your profile preferences.</p>
      </header>

      <Card>
        <form className="space-y-3" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <Input placeholder="Display name" {...register('name')} />
          <Input placeholder="New password (optional)" type="password" {...register('password')} />
          <Button disabled={mutation.isPending} type="submit">
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  )
}
