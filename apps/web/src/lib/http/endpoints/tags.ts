import { http } from '../client'
import type { Tag } from '../../types/api'

export const tagApi = {
  async listTags(orgId: string) {
    const { data } = await http.get<Tag[]>(`/orgs/${orgId}/tags`)
    return data
  },
  async createTag(orgId: string, name: string) {
    const { data } = await http.post<Tag>(`/orgs/${orgId}/tags`, { name })
    return data
  },
  async deleteTag(orgId: string, tagId: string) {
    await http.delete(`/orgs/${orgId}/tags/${tagId}`)
  },
}
