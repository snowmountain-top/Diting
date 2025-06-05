import { z } from 'zod'
import taskService from '../../core/modules/task/service'
import { TaskRunMode, TaskStatus } from '../../enum'
import { DitingTypes } from '../../types'
import { ZodFunctionValidate } from '../../utils/ZodFunctionValidate'
import { isCronExp } from '../../utils/regValidator'
import { BizError } from '@be-link/shield-cli-nodejs'
import scheduleService from '../../core/modules/schedule/service'

class TaskController implements DitingTypes.ITaskController {
  @ZodFunctionValidate({
    request: z.object({
      name: z.string(),
      sql: z.string(),
      jsScript: z.string(),
      cronExpression: z
        .string()
        .refine(isCronExp, { message: 'CRON 表达式格式无效，示例: 0 0 * * * *' }),
      runMode: z.nativeEnum(TaskRunMode),
      feishuMetaData: z.object({
        url: z.string(),
        wikiId: z.string(),
        tableId: z.string(),
        objToken: z.string(),
      }),
      creatorName: z.string(),
      updaterName: z.string(),
    }),
  })
  async create(
    request: DitingTypes.Request.ITaskCreateRequest,
  ): Promise<DitingTypes.Response.ITaskCreateResponse> {
    const task = await taskService.create(request)
    if (task.runMode === TaskRunMode.CRON) {
      scheduleService.startJob(task)
    }
    return {
      id: task.id,
    }
  }

  @ZodFunctionValidate({
    request: z.object({
      id: z.string(),
      operatorName: z.string(),
      attributes: z
        .object({
          name: z.string().optional(),
          sql: z.string().optional(),
          jsScript: z.string().optional(),
          cronExpression: z
            .string()
            .refine((val) => isCronExp(val), { message: 'CRON 表达式格式无效，示例: 0 0 * * * *' })
            .optional(),
        })
        .refine((val) => Object.keys(val).length > 0, { message: '至少更新一个字段' }),
    }),
  })
  async update(request: DitingTypes.Request.ITaskUpdateRequest): Promise<void> {
    request.attributes.updaterName = request.operatorName
    await taskService.update(request.id, request.attributes)
  }

  @ZodFunctionValidate({
    request: z.object({
      id: z.string(),
      operatorName: z.string(),
      status: z.nativeEnum(TaskStatus),
    }),
  })
  async changeStatus(request: DitingTypes.Request.ITaskChangeStatusRequest): Promise<void> {
    const attributes = {
      status: request.status,
      updaterName: request.operatorName,
    }
    await taskService.update(request.id, attributes)
  }

  @ZodFunctionValidate({
    request: z.object({
      name: z.string().optional(),
      status: z.array(z.nativeEnum(TaskStatus)).optional(),
      pageIndex: z.number().refine((val) => val >= 0, { message: 'pageIndex 必须大于等于 0' }),
      pageSize: z
        .number()
        .refine((val) => val > 0 && val <= 100, { message: 'pageSize 必须大于 0 且小于等于 100' }),
      sort: z
        .object({
          createdAt: z.enum(['DESC', 'ASC']).optional(),
        })
        .optional(),
    }),
  })
  query(
    request: DitingTypes.Request.ITaskQueryRequest,
  ): Promise<DitingTypes.Response.ITaskQueryResponse> {
    return taskService.query(request)
  }

  @ZodFunctionValidate({
    request: z.object({
      taskId: z.string(),
      executorName: z.string(),
    }),
  })
  async manualRun(request: DitingTypes.Request.ITaskManualRunRequest): Promise<void> {
    const task = await taskService.get(request.taskId)
    if (!task) {
      throw new BizError('任务不存在')
    }
    if (task.status !== TaskStatus.ACTIVE) {
      throw new BizError('任务状态不合法')
    }
    if (task.runMode !== TaskRunMode.MANUAL) {
      throw new BizError('当前任务不支持手动运行')
    }
    await scheduleService.startJob(task)
  }
}

const taskController = new TaskController()

export default taskController
