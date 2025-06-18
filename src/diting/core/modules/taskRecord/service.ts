import getLogger from '../../../utils/logger'
import TaskEntity from '../../entity/Task'
import TaskRecordEntity from '../../entity/TaskRecord'
import taskRecordRepository from '../../repository/database/taskRecord'
import EntityBuilder from '../builder/entityBuilder'

const logger = getLogger()

class TaskRecordService {
  async initialFromTask(task: TaskEntity) {
    const taskRecord = EntityBuilder.buildTaskRecordEntityFromTask(task)
    await taskRecordRepository.create(taskRecord)
    return taskRecord
  }

  async update(taskRecordId: string, attributes: Partial<TaskRecordEntity>) {
    logger.info(`更新任务记录[${taskRecordId}], 更新内容: ${JSON.stringify(attributes)}`)
    return taskRecordRepository.update(taskRecordId, attributes)
  }

  async queryByTaskId(param: { taskId?: string; pageIndex: number; pageSize: number }) {
    const { data, total } = await taskRecordRepository.queryByTaskId(
      param.taskId,
      param.pageIndex,
      param.pageSize,
    )
    return {
      data,
      total,
    }
  }
}

const taskRecordService = new TaskRecordService()

export default taskRecordService
