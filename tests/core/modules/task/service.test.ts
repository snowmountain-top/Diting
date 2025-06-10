import taskService from '../../../../src/diting/core/modules/task/service'

describe('task service', () => {
  beforeAll(() => {
    jest.mock('../../../../src/diting/core/modules/task/service', () => {
      return {
        create: jest.fn(),
      }
    })
  })
  it('task create', async () => {
    const res = await taskService.create({
      name: 'test',
    })
    expect(res).toBe(true)
  })
})