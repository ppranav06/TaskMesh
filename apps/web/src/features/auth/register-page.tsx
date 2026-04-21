import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { toast } from 'sonner'

const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short.'),
  email: z.string().email('Use a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()

  const { register, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterForm) => {
    try {
      await registerUser(values)
      navigate('/orgs/select')
    } catch {
      toast.error('Unable to register with these details.')
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md space-y-6 p-8 text-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-main">Create account</h1>
          <p className="mt-2 text-sm text-muted">Start your workspace in seconds.</p>
        </div>

        <form className="space-y-3 text-left" onSubmit={handleSubmit(onSubmit)}>
          <Input placeholder="Full name" {...register('name')} />
          <Input placeholder="you@example.com" type="email" {...register('email')} />
          <Input placeholder="Password" type="password" {...register('password')} />
          <Button className="w-full" disabled={formState.isSubmitting} type="submit">
            {formState.isSubmitting ? 'Creating...' : 'Create account'}
          </Button>
        </form>

        <p className="text-sm text-muted">
          Already have an account?{' '}
          <Link className="font-semibold text-primary" to="/login">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}
