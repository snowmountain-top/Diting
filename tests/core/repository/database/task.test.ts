import '../../../utils/initMock'
import taskRepository from '../../../../src/diting/core/repository/database/task'
import { TaskStatus } from '../../../../src/diting/enum'
import TaskEntity from '../../../../src/diting/core/entity/Task'

describe('task repository', () => {
  it('task create and get', async () => {
    const data = {
      name: 'test',
      status: TaskStatus.ACTIVE,
      sql: '',
      jsScript: '',
      cronExpression: '',
      creatorName: '',
      updaterName: '',
      id: '1111',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: 0,
    }
    let task = new TaskEntity()
    task = Object.assign(task, data)
    await taskRepository.create(task)

    const taskFromDB = await taskRepository.get('1111')
    expect(taskFromDB?.id).toBe('1111')
    expect(taskFromDB?.name).toBe('test')
  })
})