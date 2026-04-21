import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { orgApi } from '../../lib/http/endpoints/orgs'
import { useOrg } from '../../context/org-context'
import { canDeleteOrganization, canManageOrganization } from '../../lib/permissions/rbac'

export function OrganizationSettingsPage() {
  const queryClient = useQueryClient()
  const { orgId = '' } = useParams()
  const { activeMembership, refreshOrganizations } = useOrg()

  const membersQuery = useQuery({
    queryKey: ['org-members', orgId],
    queryFn: () => orgApi.listMembers(orgId),
    enabled: Boolean(orgId),
  })

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      email: '',
      role: 'member' as 'owner' | 'admin' | 'member',
    },
  })

  const inviteMutation = useMutation({
    mutationFn: async (values: { email: string; role: 'owner' | 'admin' | 'member' }) =>
      orgApi.inviteMember(orgId, values.email, values.role),
    onSuccess: async () => {
      reset()
      await queryClient.invalidateQueries({ queryKey: ['org-members', orgId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => orgApi.deleteOrganization(orgId),
    onSuccess: async () => {
      await refreshOrganizations()
    },
  })

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-main">Organization Settings</h1>
        <p className="mt-2 text-sm text-muted">Manage team members and workspace controls.</p>
      </header>

      <Card className="space-y-3">
        <p className="text-sm font-semibold text-main">Invite Team Member</p>
        <form className="grid gap-3 md:grid-cols-[1fr_160px_auto]" onSubmit={handleSubmit((values) => inviteMutation.mutate(values))}>
          <Input placeholder="colleague@company.com" {...register('email')} />
          <select className="rounded-pill bg-input px-4 py-2.5 text-sm text-main" {...register('role')}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <Button disabled={!canManageOrganization(activeMembership?.role) || inviteMutation.isPending}>
            Invite
          </Button>
        </form>
      </Card>

      <Card>
        <p className="mb-4 text-sm font-semibold text-main">Team Members</p>
        <div className="space-y-2">
          {membersQuery.data?.map((member) => (
            <div className="flex items-center justify-between rounded-soft bg-input px-4 py-3" key={member.user_id}>
              <div>
                <p className="font-semibold text-main">{member.name}</p>
                <p className="text-xs text-muted">{member.email}</p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{member.role}</p>
            </div>
          ))}
        </div>
      </Card>

      {canDeleteOrganization(activeMembership?.role) && (
        <Card className="bg-dangerLight">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-main">Danger Zone</p>
              <p className="text-sm text-muted">Delete this organization and all related data.</p>
            </div>
            <Button onClick={() => deleteMutation.mutate()} variant="danger">
              Delete Organization
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
