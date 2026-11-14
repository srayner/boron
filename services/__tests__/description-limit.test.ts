import { describe, it, expect } from 'vitest'
import { prismaMock } from '../../test/mocks/prisma'
import { createProject, updateProject } from '../projects'
import { createTask, updateTask } from '../tasks'
import { createMilestone, updateMilestone } from '../milestones'
import { DESCRIPTION_MAX_LENGTH } from '@/lib/validation/description'

const saved = {
  id: 'rec-1',
  name: 'Name',
  description: '',
  projectId: 'project-1',
  milestoneId: null,
  updatedAt: new Date(),
  tags: [],
}

// Every create and update path for the three Markdown description types.
const writes = [
  ['createProject', () => prismaMock.project.create, (d: object) => createProject(d)],
  ['updateProject', () => prismaMock.project.update, (d: object) => updateProject('rec-1', d)],
  ['createTask', () => prismaMock.task.create, (d: object) => createTask({ projectId: 'project-1', ...d })],
  ['updateTask', () => prismaMock.task.update, (d: object) => updateTask('rec-1', d)],
  ['createMilestone', () => prismaMock.milestone.create, (d: object) => createMilestone({ projectId: 'project-1', ...d })],
  ['updateMilestone', () => prismaMock.milestone.update, (d: object) => updateMilestone('rec-1', d)],
] as const

function mockSaves() {
  prismaMock.project.create.mockResolvedValue(saved as never)
  prismaMock.project.update.mockResolvedValue(saved as never)
  prismaMock.task.create.mockResolvedValue(saved as never)
  prismaMock.task.update.mockResolvedValue(saved as never)
  prismaMock.task.findUnique.mockResolvedValue({ ...saved, status: "PLANNED", completedAt: null } as never)
  prismaMock.milestone.create.mockResolvedValue(saved as never)
  prismaMock.milestone.update.mockResolvedValue(saved as never)
}

describe.each(writes)('%s description', (_name, model, write) => {
  // The limit itself is allowed and stored in full.
  it('stores a description of exactly the limit', async () => {
    mockSaves()
    const description = 'a'.repeat(DESCRIPTION_MAX_LENGTH)

    await write({ name: 'Name', description })

    expect(model()).toHaveBeenCalledOnce()
    expect(model().mock.calls[0][0].data.description).toBe(description)
  })

  // Too long, or not text: a 400 the caller can show, and nothing is written.
  it.each([
    ['one character over the limit', 'a'.repeat(DESCRIPTION_MAX_LENGTH + 1), /20,000 characters or fewer/],
    ['a number', 42, /must be text/],
    ['an object', { text: 'x' }, /must be text/],
  ])('rejects %s with a 400', async (_label, description, message) => {
    mockSaves()

    await expect(write({ name: 'Name', description })).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(message),
    })
    expect(model()).not.toHaveBeenCalled()
    expect(prismaMock.searchIndex.upsert).not.toHaveBeenCalled()
  })

  // Missing or null descriptions are stored as empty text, as before.
  it.each([
    ['missing', {}],
    ['null', { description: null }],
  ])('stores an empty description when it is %s', async (_label, fields) => {
    mockSaves()

    await write({ name: 'Name', ...fields })

    expect(model().mock.calls[0][0].data.description).toBe('')
  })
})
