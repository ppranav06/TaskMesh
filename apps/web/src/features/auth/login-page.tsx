import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Use a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginForm) => {
    try {
      await login(values)
      navigate('/orgs/select')
    } catch {
      toast.error('Unable to sign in with these credentials.')
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md space-y-6 p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-soft bg-gradient-to-br from-primary to-peach text-white">
          TM
        </div>

        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-main">Find your flow.</h1>
          <p className="mt-2 text-sm text-muted">Sign in to continue to TaskMesh.</p>
        </div>

        <form className="space-y-3 text-left" onSubmit={handleSubmit(onSubmit)}>
          <Input placeholder="you@example.com" type="email" {...register('email')} />
          <Input placeholder="Password" type="password" {...register('password')} />
          <Button className="w-full" disabled={formState.isSubmitting} type="submit">
            {formState.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <a
          className="block rounded-pill bg-input px-4 py-2.5 text-sm font-semibold text-main"
          href={`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'}${import.meta.env.VITE_API_OAUTH_ENDPOINT ?? '/auth/oauth/google'}`}
        >
          Sign in with Google
        </a>

        <p className="text-sm text-muted">
          No account?{' '}
          <Link className="font-semibold text-primary" to="/register">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  )
}
