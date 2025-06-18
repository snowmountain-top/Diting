import { In } from 'typeorm'
import { getDataSource } from '../../connection/database'
import TaskRecordEntity from '../../entity/TaskRecord'
import getLogger from '../../../utils/logger'

const logger = getLogger()

class TaskRecordRepository {
  async create(taskRecord: TaskRecordEntity) {
    const dataSource = await getDataSource()
    return dataSource.getRepository(TaskRecordEntity).insert(taskRecord)
  }

  async save(taskRecord: TaskRecordEntity) {
    const dataSource = await getDataSource()
    return dataSource.getRepository(TaskRecordEntity).save(taskRecord)
  }

  async update(taskRecordId: string, attributes: Partial<TaskRecordEntity>) {
    logger.info(
      `TaskRecord Repository: 更新任务记录[${taskRecordId}], 更新内容: ${JSON.stringify(
        attributes,
      )}`,
    )
    const dataSource = await getDataSource()
    return dataSource
      .getRepository(TaskRecordEntity)
      .createQueryBuilder()
      .update()
      .set({
        updatedAt: Date.now(),
        ...attributes,
      })
      .where({
        id: taskRecordId,
      })
      .execute()
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
