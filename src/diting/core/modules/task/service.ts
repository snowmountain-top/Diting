import { keyBy } from 'lodash'
import taskRepository from '../../repository/database/task'
import TaskEntity from '../../entity/Task'
import { TaskRunMode, TaskStatus } from '../../../enum'
import EntityBuilder from '../builder/entityBuilder'
import difyClient from '../../../vendors/dify'
import feishuClient from '../../../vendors/feishuClient'
import scheduleService from '../schedule/service'
import BizError from '../../../errors/BizError'

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
    const originalTask = await this.get(taskId)
    attributes.updatedAt = Date.now()
    const updatedTask = await taskRepository.update(taskId, attributes)

    // 任务更新后的调度处理逻辑
    if (attributes.cronExpression && attributes.cronExpression !== originalTask.cronExpression) {
      // 如果cron表达式有变更，需要重启任务
      scheduleService.restartJob(taskId)
    } else if (
      originalTask.runMode === TaskRunMode.MANUAL &&
      attributes.runMode === TaskRunMode.CRON
    ) {
      // 手动模式变更为定时模式，需要重启任务
      scheduleService.restartJob(taskId)
    } else if (
      originalTask.runMode === TaskRunMode.CRON &&
      attributes.runMode === TaskRunMode.MANUAL
    ) {
      // 定时模式变更为手动模式，需要停止任务
      scheduleService.stopJob(taskId)
    }

    return updatedTask
  }

  async remove(taskId: string) {
    if (!taskId) {
      throw new BizError('任务ID不能为空')
    }
    await taskRepository.remove(taskId)
    scheduleService.stopJob(taskId)
  }

  async query(param: {
    name?: string
    status?: TaskStatus[]
    pageIndex: number
    pageSize: number
    sort?: {
      // 按创建时间
      createdAt?: 'DESC' | 'ASC'
      // 按任务名称
      name?: 'DESC' | 'ASC'
    }
  }) {
    const { data, total } = await taskRepository.query({
      name: param.name,
      status: param.status,
      pageIndex: param.pageIndex,
      pageSize: param.pageSize,
      sort: {
        createdAt: param.sort?.createdAt,
        name: param.sort?.name,
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

  async getFeishuTableMetaData(url: string) {
    return feishuClient.getTableMetaDataFromUrl(url)
  }
}

const taskService = new TaskService()

export default taskService
