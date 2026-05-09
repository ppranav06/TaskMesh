import { faker } from '@faker-js/faker'
import type { User, OrgMembership, Board, BoardList, Task, TaskHistoryEntry } from '../lib/types/api'

export const createMockUser = (): User => ({
  user_id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  oauth_provider: null,
  is_active: true,
  created_at: faker.date.past().toISOString(),
})

export const createMockOrgMembership = (): OrgMembership => ({
  org_id: faker.string.uuid(),
  name: faker.company.name(),
  role: faker.helpers.arrayElement(['owner', 'admin', 'member']),
  joined_at: faker.date.past().toISOString(),
})

export const createMockBoard = (): Board => ({
  board_id: faker.string.uuid(),
  org_id: faker.string.uuid(),
  title: faker.lorem.words(3),
  description: faker.lorem.sentence(),
  created_by: faker.string.uuid(),
  created_at: faker.date.past().toISOString(),
})

export const createMockBoardList = (): BoardList => ({
  list_id: faker.string.uuid(),
  board_id: faker.string.uuid(),
  title: faker.lorem.word(),
  position: faker.number.int({ min: 1, max: 5 }),
  is_final_list: faker.datatype.boolean(),
  task_count: faker.number.int({ min: 0, max: 10 }),
})

export const createMockTask = (): Task => ({
  task_id: faker.string.uuid(),
  list_id: faker.string.uuid(),
  board_id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  due_date: faker.date.future().toISOString().split('T')[0],
  priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
  tags: [],
  assignees: [],
  created_at: faker.date.past().toISOString(),
})

export const createMockTaskHistoryEntry = (): TaskHistoryEntry => ({
  history_id: faker.string.uuid(),
  change_type: faker.helpers.arrayElement(['created', 'updated', 'moved', 'completed', 'assigned']),
  changed_at: faker.date.past().toISOString(),
  changed_by: {
    user_id: faker.string.uuid(),
    name: faker.person.fullName(),
  },
})
