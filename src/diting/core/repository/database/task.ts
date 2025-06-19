import { isEmpty } from 'lodash'
import { In } from 'typeorm'
import { TaskRunMode, TaskStatus } from '../../../enum'
import { getDataSource } from '../../connection/database'
import TaskEntity from '../../entity/Task'

class TaskRepository {
  async get(taskId: string) {
    const dataSource = await getDataSource()
    return dataSource.getRepository(TaskEntity).findOne({
      where: {
        id: taskId,
      },
    })
  }

  async mget(taskIds: string[]) {
    const dataSource = await getDataSource()
    return dataSource.getRepository(TaskEntity).find({
      where: {
        id: In(taskIds),
      },
    })
  }

  async create(task: TaskEntity) {
    const dataSource = await getDataSource()
    return dataSource.getRepository(TaskEntity).insert(task)
  }

  async update(taskId: string, attributes: Partial<TaskEntity>) {
    const dataSource = await getDataSource()
    return dataSource.getRepository(TaskEntity).update(taskId, attributes)
  }

  async remove(taskId: string) {
    const dataSource = await getDataSource()
    return dataSource.getRepository(TaskEntity).update(taskId, {
      status: TaskStatus.DELETED,
      deletedAt: Date.now(),
    })
  }

  async query(param: {
    name?: string
    status: TaskStatus[]
    pageIndex: number
    pageSize: number
    sort: {
      // 按创建时间
      createdAt?: 'DESC' | 'ASC'
      // 按任务名称
      name?: 'DESC' | 'ASC'
    }
  }) {
    const dataSource = await getDataSource()
    const queryBuilder = dataSource.getRepository(TaskEntity).createQueryBuilder('task')
    queryBuilder.where('task.deletedAt = 0')
    if (!isEmpty(param.status)) {
      queryBuilder.andWhere('task.status IN (:...status)', { status: param.status })
    }
    if (param.name) {
      queryBuilder.andWhere('MATCH(task.name) AGAINST("+:name" IN BOOLEAN MODE)', {
        name: param.name,
      })
    }
    queryBuilder.offset(param.pageIndex * param.pageSize)
    queryBuilder.limit(param.pageSize)
    for (const [key, value] of Object.entries(param.sort)) {
      if (value) {
        queryBuilder.addOrderBy(`task.${key}`, value)
      }
    }
    const [data, total] = await queryBuilder.getManyAndCount()
    return { data, total }
  }

  async queryAllActiveCronTask() {
    const dataSource = await getDataSource()
    return dataSource.getRepository(TaskEntity).find({
      where: {
        status: TaskStatus.ACTIVE,
        runMode: TaskRunMode.CRON,
      },
    })
  }
}

const taskRepository = new TaskRepository()

export default taskRepository
