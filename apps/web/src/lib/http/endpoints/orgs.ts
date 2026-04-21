import { http } from '../client'
import type { OrgMembership, Organization, Role, User } from '../../types/api'

export interface OrgMember {
  user_id: string
  name: string
  email: string
  role: Role
  joined_at: string
}

export const orgApi = {
  async listMemberships() {
    const { data } = await http.get<OrgMembership[]>('/orgs')
    return data
  },
  async createOrganization(name: string) {
    const { data } = await http.post<Organization>('/orgs', { name })
    return data
  },
  async updateOrganization(orgId: string, name: string) {
    const { data } = await http.put<Organization>(`/orgs/${orgId}`, { name })
    return data
  },
  async deleteOrganization(orgId: string) {
    await http.delete(`/orgs/${orgId}`)
  },
  async listMembers(orgId: string) {
    const { data } = await http.get<OrgMember[]>(`/orgs/${orgId}/members`)
    return data
  },
  async inviteMember(orgId: string, email: string, role: Role) {
    const { data } = await http.post(`/orgs/${orgId}/members/invite`, { email, role })
    return data
  },
  async updateMemberRole(orgId: string, userId: string, role: Role) {
    const { data } = await http.put<User>(`/orgs/${orgId}/members/${userId}`, { role })
    return data
  },
  async removeMember(orgId: string, userId: string) {
    await http.delete(`/orgs/${orgId}/members/${userId}`)
  },
}
