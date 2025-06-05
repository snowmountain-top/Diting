import TaskEntity from '../../entity/Task'
import TaskRecordEntity from '../../entity/TaskRecord'
import taskRecordRepository from '../../repository/database/taskRecord'
import EntityBuilder from '../builder/entityBuilder'

class TaskRecordService {
  async initialFromTask(task: TaskEntity) {
    const taskRecord = EntityBuilder.buildTaskRecordEntityFromTask(task)
    await taskRecordRepository.create(taskRecord)
    return taskRecord
  }

  async update(id: string, attributes: Partial<TaskRecordEntity>) {
    await taskRecordRepository.update(id, attributes)
  }

  async queryByTaskId(param: {
    taskId?: string
    pageIndex: number
    pageSize: number
  }) {
    const { data, total } = await taskRecordRepository.queryByTaskId(
      param.taskId,
      param.pageIndex,
      param.pageSize
    )
    return {
      data,
      total,
    }
  }
}

const taskRecordService = new TaskRecordService()

export default taskRecordService
