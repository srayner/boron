import { describe, it, expect } from 'vitest'
import { updateSearchIndex, find } from '../search'
import { prismaMock } from '../../test/mocks/prisma'

const updatedAt = new Date('2026-11-14T12:00:00Z')

describe('updateSearchIndex', () => {
  // Each entity type is linked through its own column, so the database
  // cascade removes the row when the record is deleted.
  it.each([
    ['project', 'projectId'],
    ['task', 'taskId'],
    ['milestone', 'milestoneId'],
    ['cost', 'costId'],
  ] as const)('links a %s row through %s', async (entityType, column) => {
    await updateSearchIndex(prismaMock, entityType, {
      id: 'rec-1',
      name: 'Name',
      description: '',
      updatedAt,
    })

    const call = prismaMock.searchIndex.upsert.mock.calls[0][0]
    expect(call.where).toEqual({ [column]: 'rec-1' })
    expect(call.create).toMatchObject({ [column]: 'rec-1', entityType })
    expect(call.update).toMatchObject({ entityType })
  })

  it('indexes the description as plain text, followed by tag names', async () => {
    await updateSearchIndex(prismaMock, 'task', {
      id: 'task-1',
      name: 'Release',
      description: '## Plan\n\n- ship the **quick** fix\n- [notify](https://example.com) users',
      updatedAt,
      tags: [{ name: 'backend' }, { name: 'Urgent' }],
    })

    const call = prismaMock.searchIndex.upsert.mock.calls[0][0]
    const expected = {
      title: 'Release',
      content: 'Plan ship the quick fix notify users | backend | Urgent',
      date: updatedAt,
    }
    expect(call.create).toMatchObject(expected)
    expect(call.update).toMatchObject(expected)
  })

  // Costs may have no name or description; they must still be indexed.
  it.each([
    ['no name', { name: null, description: 'Paint', tags: [] }, { title: '', content: 'Paint' }],
    ['no description', { name: 'Paint', description: null, tags: [{ name: 'decor' }] }, { title: 'Paint', content: 'decor' }],
    ['nothing to index', { name: null, description: null }, { title: '', content: '' }],
  ])('indexes a record with %s', async (_label, fields, expected) => {
    await updateSearchIndex(prismaMock, 'cost', { id: 'cost-1', updatedAt, ...fields })

    expect(prismaMock.searchIndex.upsert.mock.calls[0][0].create).toMatchObject(expected)
  })
})

describe('find', () => {
  // The API keeps returning entityId (used by the search page and boron-mcp),
  // taken from whichever link column is set.
  it('returns entityId from the link column and hides the link columns', async () => {
    const base = { title: 't', content: 'c', date: updatedAt, projectId: null, taskId: null, milestoneId: null, costId: null }
    prismaMock.searchIndex.findMany.mockResolvedValue([
      { ...base, id: 's1', entityType: 'project', projectId: 'p1' },
      { ...base, id: 's2', entityType: 'task', taskId: 't1' },
      { ...base, id: 's3', entityType: 'milestone', milestoneId: 'm1' },
      { ...base, id: 's4', entityType: 'cost', costId: 'c1' },
    ] as never)
    prismaMock.searchIndex.count.mockResolvedValue(4)

    const { results, totalCount } = await find('x', { take: 20, skip: 0 }, { date: 'desc' })

    expect(totalCount).toBe(4)
    expect(results.map((r) => [r.entityType, r.entityId])).toEqual([
      ['project', 'p1'],
      ['task', 't1'],
      ['milestone', 'm1'],
      ['cost', 'c1'],
    ])
    expect(Object.keys(results[0]).sort()).toEqual(
      ['content', 'date', 'entityId', 'entityType', 'id', 'title']
    )
  })
})
