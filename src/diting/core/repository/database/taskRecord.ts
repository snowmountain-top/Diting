import { In } from 'typeorm'
import { getDataSource } from '../../connection/database'
import TaskRecordEntity from '../../entity/TaskRecord'

class TaskRecordRepository {
  async create(taskRecord: TaskRecordEntity) {
    const dataSource = await getDataSource()
    return dataSource.getRepository(TaskRecordEntity).insert(taskRecord)
  }

  async update(taskRecordId: string, attributes: Partial<TaskRecordEntity>) {
    const dataSource = await getDataSource()
    return dataSource.getRepository(TaskRecordEntity).update(taskRecordId, attributes)
  }

  async get(taskRecordId: string) {
    const dataSource = await getDataSource()
    return dataSource.getRepository(TaskRecordEntity).findOne({
      where: {
        id: taskRecordId,
      },
    })
  }

  async mget(taskRecordIds: string[]) {
    const dataSource = await getDataSource()
    return dataSource.getRepository(TaskRecordEntity).find({
      where: {
        id: In(taskRecordIds),
      },
    })
  }

  async queryByTaskId(taskId: string, pageIndex: number, pageSize: number) {
    const dataSource = await getDataSource()
    const [data, total] = await dataSource.getRepository(TaskRecordEntity).findAndCount({
      where: {
        taskId,
      },
      order: {
        createdAt: 'DESC',
      },
      skip: (pageIndex - 1) * pageSize,
      take: pageSize,
    })
    return {
      data,
      total,
    }
  }
}

const taskRecordRepository = new TaskRecordRepository()

export default taskRecordRepository
