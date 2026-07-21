import { describe, it, expect } from 'vitest'
import { updateTask } from '../tasks'
import { prismaMock } from '../../test/mocks/prisma'

const existingTask = {
  id: 'task-1',
  name: 'Old Name',
  description: '',
  status: 'PLANNED' as const,
  priority: 'MEDIUM' as const,
  progress: { toNumber: () => 0 } as any,
  completedAt: null,
  projectId: 'project-1',
  parentTaskId: null,
  archived: false,
  order: null,
  milestoneId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  startDate: null,
  dueDate: null,
  project: { id: 'project-1', name: 'Test Project' } as any,
  subTasks: [],
  costs: [],
  milestone: null,
  tags: [],
}

const updatedTask = {
  ...existingTask,
  name: 'Updated Name',
  status: 'IN_PROGRESS' as const,
  progress: { toNumber: () => 50 } as any,
  updatedAt: new Date(),
  tags: [],
}

describe('updateTask', () => {
  it('indexes the task with entity type "task" not "project"', async () => {
    prismaMock.task.findUnique.mockResolvedValue(existingTask as any)
    prismaMock.task.update.mockResolvedValue(updatedTask as any)
    // project.findUnique returns undefined by default → updateProjectProgress returns early

    await updateTask('task-1', {
      name: 'Updated Name',
      description: '',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      progress: 50,
      tags: null,
      startDate: null,
      dueDate: null,
      milestoneId: null,
    })

    // BUG 2.4 (audit): updateTask calls updateSearchIndex("project", updatedTask)
    // instead of updateSearchIndex("task", updatedTask)
    // CURRENTLY FAILS: entityType in the upsert call is "project" not "task"
    expect(prismaMock.searchIndex.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ entityType: 'task' }),
        update: expect.objectContaining({ entityType: 'task' }),
      })
    )
  })
})
