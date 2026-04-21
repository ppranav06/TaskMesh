import { http } from '../client'
import type { Board, BoardList } from '../../types/api'

export const boardApi = {
  async listBoards(orgId: string) {
    const { data } = await http.get<Board[]>(`/orgs/${orgId}/boards`)
    return data
  },
  async getBoard(orgId: string, boardId: string) {
    const { data } = await http.get<Board & { lists: BoardList[] }>(
      `/orgs/${orgId}/boards/${boardId}`,
    )
    return data
  },
  async createBoard(orgId: string, payload: { title: string; description?: string }) {
    const { data } = await http.post<Board>(`/orgs/${orgId}/boards`, payload)
    return data
  },
}
