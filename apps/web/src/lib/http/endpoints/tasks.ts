import { http } from '../client'
import type { PaginatedTasks, Task, TaskHistoryEntry } from '../../types/api'

export const taskApi = {
  async listTasks(orgId: string, boardId: string, query: Record<string, string> = {}) {
    const params = new URLSearchParams(query).toString()
    const suffix = params ? `?${params}` : ''
    const { data } = await http.get<PaginatedTasks>(
      `/orgs/${orgId}/boards/${boardId}/tasks${suffix}`,
    )
    return data
  },
  async getTask(orgId: string, boardId: string, taskId: string) {
    const { data } = await http.get<Task>(`/orgs/${orgId}/boards/${boardId}/tasks/${taskId}`)
    return data
  },
  async updateTask(
    orgId: string,
    boardId: string,
    taskId: string,
    payload: Partial<Pick<Task, 'title' | 'description' | 'due_date' | 'priority'>>,
  ) {
    const { data } = await http.put<Task>(
      `/orgs/${orgId}/boards/${boardId}/tasks/${taskId}`,
      payload,
    )
    return data
  },
  async moveTask(orgId: string, boardId: string, taskId: string, toListId: string) {
    const { data } = await http.put(`/orgs/${orgId}/boards/${boardId}/tasks/${taskId}/move`, {
      to_list_id: toListId,
    })
    return data
  },
  async getHistory(orgId: string, boardId: string, taskId: string) {
    const { data } = await http.get<TaskHistoryEntry[]>(
      `/orgs/${orgId}/boards/${boardId}/tasks/${taskId}/history`,
    )
    return data
  },
}
