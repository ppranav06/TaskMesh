/* eslint-disable @typescript-eslint/no-unused-vars */
import { http, HttpResponse } from 'msw'
import {
  createMockUser,
  createMockOrgMembership,
  createMockBoard,
  createMockBoardList,
  createMockTask,
  createMockTaskHistoryEntry,
} from './mockData'
/* eslint-enable @typescript-eslint/no-unused-vars */

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

// Simulated data storage
const mockUsers = new Map()
const mockOrganizations = new Map()
const mockBoards = new Map()
const mockLists = new Map()
const mockTasks = new Map()

// Initialize with sample data
const seedUser = createMockUser()
mockUsers.set(seedUser.user_id, seedUser)

const seedOrgs = Array.from({ length: 3 }, () => {
  const org = createMockOrgMembership()
  mockOrganizations.set(org.org_id, org)
  return org
})

seedOrgs.forEach((org) => {
  const lists = Array.from({ length: 3 }, () => {
    const list = createMockBoardList()
    list.board_id = org.org_id
    mockLists.set(list.list_id, list)
    return list
  })

  const board = createMockBoard()
  board.org_id = org.org_id
  mockBoards.set(board.board_id, board)

  lists.forEach((list) => {
    Array.from({ length: 3 }, () => {
      const task = createMockTask()
      task.board_id = board.board_id
      task.list_id = list.list_id
      mockTasks.set(task.task_id, task)
    })
  })
})

export const handlers = [
  // Auth endpoints
  http.post(`${baseURL}/auth/login`, async ({ request }) => {
    await request.json()
    return HttpResponse.json(
      {
        access_token: `mock-access-${Date.now()}`,
        refresh_token: `mock-refresh-${Date.now()}`,
        token_type: 'bearer',
        expires_in: 3600,
      },
      { status: 200 },
    )
  }),

  http.post(`${baseURL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { name: string; email: string; password: string }
    const newUser = {
      ...createMockUser(),
      name: body.name,
      email: body.email,
    }
    mockUsers.set(newUser.user_id, newUser)
    return HttpResponse.json(newUser, { status: 201 })
  }),

  http.post(`${baseURL}/auth/refresh`, () => {
    return HttpResponse.json(
      {
        access_token: `mock-access-${Date.now()}`,
        token_type: 'bearer',
        expires_in: 3600,
      },
      { status: 200 },
    )
  }),

  http.post(`${baseURL}/auth/logout`, () => {
    return HttpResponse.json(null, { status: 204 })
  }),

  http.get(`${baseURL}/users/me`, () => {
    const user = Array.from(mockUsers.values())[0]
    return HttpResponse.json(user, { status: 200 })
  }),

  http.put(`${baseURL}/users/me`, async ({ request }) => {
    const body = (await request.json()) as Partial<{ name: string; password: string }>
    const user = Array.from(mockUsers.values())[0]
    if (body.name) user.name = body.name
    return HttpResponse.json(user, { status: 200 })
  }),

  // Organizations
  http.get(`${baseURL}/orgs`, () => {
    const memberships = Array.from(mockOrganizations.values())
    return HttpResponse.json(memberships, { status: 200 })
  }),

  http.post(`${baseURL}/orgs`, async ({ request }) => {
    const body = (await request.json()) as { name: string }
    const newOrg = createMockOrgMembership()
    newOrg.name = body.name
    mockOrganizations.set(newOrg.org_id, newOrg)
    return HttpResponse.json(newOrg, { status: 201 })
  }),

  http.put(`${baseURL}/orgs/:orgId`, async ({ params, request }) => {
    const { orgId } = params
    const body = (await request.json()) as { name: string }
    const org = mockOrganizations.get(orgId as string)
    if (!org) return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    org.name = body.name
    return HttpResponse.json(org, { status: 200 })
  }),

  http.delete(`${baseURL}/orgs/:orgId`, ({ params }) => {
    const { orgId } = params
    mockOrganizations.delete(orgId as string)
    return HttpResponse.json(null, { status: 204 })
  }),

  http.get(`${baseURL}/orgs/:orgId/members`, ({ params }) => {
    const org = mockOrganizations.get(params.orgId as string)
    if (!org) return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    return HttpResponse.json(
      [
        {
          user_id: Array.from(mockUsers.values())[0].user_id,
          name: Array.from(mockUsers.values())[0].name,
          email: Array.from(mockUsers.values())[0].email,
          role: 'owner',
          joined_at: new Date().toISOString(),
        },
      ],
      { status: 200 },
    )
  }),

  http.post(`${baseURL}/orgs/:orgId/members/invite`, async ({ request }) => {
    const body = (await request.json()) as { email: string; role: string }
    return HttpResponse.json(
      {
        invitation_id: `invite-${Date.now()}`,
        email: body.email,
        role: body.role,
        invited_at: new Date().toISOString(),
      },
      { status: 201 },
    )
  }),

  http.put(`${baseURL}/orgs/:orgId/members/:userId`, async ({ params, request }) => {
    const { orgId, userId } = params
    const body = (await request.json()) as { role: string }
    return HttpResponse.json(
      {
        user_id: userId,
        org_id: orgId,
        role: body.role,
      },
      { status: 200 },
    )
  }),

  http.delete(`${baseURL}/orgs/:orgId/members/:userId`, () => {
    return HttpResponse.json(null, { status: 204 })
  }),

  // Boards
  http.get(`${baseURL}/orgs/:orgId/boards`, ({ params }) => {
    const boards = Array.from(mockBoards.values()).filter((b) => b.org_id === params.orgId)
    return HttpResponse.json(boards, { status: 200 })
  }),

  http.get(`${baseURL}/orgs/:orgId/boards/:boardId`, ({ params }) => {
    const board = mockBoards.get(params.boardId as string)
    if (!board || board.org_id !== params.orgId) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    const lists = Array.from(mockLists.values()).filter((l) => l.board_id === params.boardId)
    return HttpResponse.json({ ...board, lists }, { status: 200 })
  }),

  http.post(`${baseURL}/orgs/:orgId/boards`, async ({ params, request }) => {
    const body = (await request.json()) as { title: string; description?: string }
    const newBoard = createMockBoard()
    newBoard.org_id = params.orgId as string
    newBoard.title = body.title
    newBoard.description = body.description
    mockBoards.set(newBoard.board_id, newBoard)
    return HttpResponse.json(newBoard, { status: 201 })
  }),

  // Tasks
  http.get(`${baseURL}/orgs/:orgId/boards/:boardId/tasks`, ({ params }) => {
    const tasks = Array.from(mockTasks.values()).filter((t) => t.board_id === params.boardId)
    return HttpResponse.json(
      {
        total: tasks.length,
        page: 1,
        page_size: 20,
        results: tasks,
      },
      { status: 200 },
    )
  }),

  http.get(`${baseURL}/orgs/:orgId/boards/:boardId/tasks/:taskId`, ({ params }) => {
    const task = mockTasks.get(params.taskId as string)
    if (!task || task.board_id !== params.boardId) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(task, { status: 200 })
  }),

  http.post(`${baseURL}/orgs/:orgId/boards/:boardId/tasks`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<typeof createMockTask>
    const newTask = createMockTask()
    newTask.board_id = params.boardId as string
    Object.assign(newTask, body)
    mockTasks.set(newTask.task_id, newTask)
    return HttpResponse.json(newTask, { status: 201 })
  }),

  http.put(`${baseURL}/orgs/:orgId/boards/:boardId/tasks/:taskId`, async ({ params, request }) => {
    const task = mockTasks.get(params.taskId as string)
    if (!task) return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    const body = (await request.json()) as Partial<typeof task>
    Object.assign(task, body)
    return HttpResponse.json(task, { status: 200 })
  }),

  http.put(`${baseURL}/orgs/:orgId/boards/:boardId/tasks/:taskId/move`, async ({ params, request }) => {
    const task = mockTasks.get(params.taskId as string)
    if (!task) return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    const body = (await request.json()) as { to_list_id: string }
    task.list_id = body.to_list_id
    return HttpResponse.json(task, { status: 200 })
  }),

  http.delete(`${baseURL}/orgs/:orgId/boards/:boardId/tasks/:taskId`, ({ params }) => {
    mockTasks.delete(params.taskId as string)
    return HttpResponse.json(null, { status: 204 })
  }),

  http.get(`${baseURL}/orgs/:orgId/boards/:boardId/tasks/:taskId/history`, () => {
    return HttpResponse.json(
      Array.from({ length: 3 }, () => createMockTaskHistoryEntry()),
      { status: 200 },
    )
  }),

  // Tags
  http.get(`${baseURL}/orgs/:orgId/tags`, () => {
    return HttpResponse.json(
      Array.from({ length: 3 }, () => ({
        tag_id: `tag-${Date.now()}-${Math.random()}`,
        name: ['bug', 'feature', 'design'][Math.floor(Math.random() * 3)],
      })),
      { status: 200 },
    )
  }),

  http.post(`${baseURL}/orgs/:orgId/tags`, async ({ request }) => {
    const body = (await request.json()) as { name: string }
    return HttpResponse.json(
      {
        tag_id: `tag-${Date.now()}`,
        name: body.name,
      },
      { status: 201 },
    )
  }),

  http.delete(`${baseURL}/orgs/:orgId/tags/:tagId`, () => {
    return HttpResponse.json(null, { status: 204 })
  }),
]
