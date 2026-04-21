import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { useOrg } from '../../context/org-context'
import { orgApi } from '../../lib/http/endpoints/orgs'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { toast } from 'sonner'

export function OrganizationSelectorPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { organizations, setActiveOrgId, refreshOrganizations } = useOrg()

  const createOrgMutation = useMutation({
    mutationFn: async () => {
      const name = `Workspace ${new Date().toLocaleDateString()}`
      return orgApi.createOrganization(name)
    },
    onSuccess: async (organization) => {
      await refreshOrganizations()
      setActiveOrgId(organization.org_id)
      navigate(`/orgs/${organization.org_id}/boards/default`)
      toast.success('Workspace created.')
    },
    onError: () => {
      toast.error('Could not create workspace.')
    },
  })

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-main">Welcome back.</h1>
          <p className="mt-3 text-lg text-muted">Choose a workspace to find your flow.</p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {organizations.map((organization) => (
            <Card
              className="cursor-pointer space-y-3"
              key={organization.org_id}
              onClick={() => {
                setActiveOrgId(organization.org_id)
                navigate(`/orgs/${organization.org_id}/boards/default`)
              }}
            >
              <h2 className="text-xl font-bold text-main">{organization.name}</h2>
              <p className="text-sm text-muted">Role: {organization.role}</p>
            </Card>
          ))}

          <button
            className="rounded-card border border-dashed border-slate-300 bg-transparent p-8 text-muted"
            onClick={() => createOrgMutation.mutate()}
          >
            + Create Workspace
          </button>
        </div>

        <div className="text-center">
          <Button onClick={() => navigate('/login')} variant="secondary">
            Back to login
          </Button>
        </div>
      </div>
    </div>
  )
}
