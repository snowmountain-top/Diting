import { keyBy } from 'lodash'
import taskRepository from '../../repository/database/task'
import TaskEntity from '../../entity/Task'
import { TaskStatus } from '../../../enum'
import EntityBuilder from '../builder/entityBuilder'
import difyClient from '../../../vendors/dify'

class TaskService {
  async get(taskId: string) {
    const task = await taskRepository.get(taskId)
    return task
  }

  async mget(taskIds: string[]) {
    const tasks = await taskRepository.mget(taskIds)
    return keyBy(tasks, 'id')
  }

  async create(taskAttributes: Partial<TaskEntity>) {
    const task = EntityBuilder.buildTaskEntity(taskAttributes)
    await taskRepository.create(task)
    return task
  }

  async update(taskId: string, attributes: Partial<TaskEntity>) {
    attributes.updatedAt = Date.now()
    const updatedTask = await taskRepository.update(taskId, attributes)
    return updatedTask
  }

  async remove(taskId: string) {
    return taskRepository.remove(taskId)
  }

  async query(param: {
    name?: string
    status?: TaskStatus[]
    pageIndex: number
    pageSize: number
    sort?: {
      createdAt?: 'DESC' | 'ASC'
    }
  }) {
    const { data, total } = await taskRepository.query({
      name: param.name,
      status: param.status,
      pageIndex: param.pageIndex,
      pageSize: param.pageSize,
      sort: {
        createdAt: param.sort?.createdAt || 'DESC',
      },
    })
    return {
      data,
      total,
    }
  }

  async queryAllActiveCronTask() {
    return taskRepository.queryAllActiveCronTask()
  }

  async genCronExpression(content: string) {
    return difyClient.genCronExpression(content)
  }
}

const taskService = new TaskService()

export default taskService
