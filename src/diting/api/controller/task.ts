import { z } from 'zod'
import taskService from '../../core/modules/task/service'
import { TaskRunMode, TaskStatus } from '../../enum'
import { DitingTypes } from '../../types'
import { ZodFunctionValidate } from '../../utils/ZodFunctionValidate'
import { isCronExp } from '../../utils/regValidator'
import { BizError } from '@be-link/shield-cli-nodejs'
import scheduleService from '../../core/modules/schedule/service'
import TaskEntity from '../../core/entity/Task'

class TaskController implements DitingTypes.ITaskController {
  @ZodFunctionValidate({
    request: z.object({
      name: z.string(),
      sql: z.string(),
      jsScript: z.string(),
      cronExpression: z.string().refine((val) => (val ? isCronExp(val) : true), {
        message: 'CRON 表达式格式无效，示例: 0 0 * * * *',
      }),
      runMode: z.nativeEnum(TaskRunMode),
      feishuTableUrl: z.string(),
      config: z.object({
        deleteWholeFeishuTableDataBeforeRun: z.boolean(),
        autoArchiveFeishuTable: z.boolean(),
        archiveFeishuTableConfig: z
          .object({
            prefixName: z.string(),
            maxRowCount: z.number(),
          })
          .optional(),
      }),
      creatorName: z.string(),
      updaterName: z.string(),
    }),
  })
  async create(
    request: DitingTypes.Request.ITaskCreateRequest,
  ): Promise<DitingTypes.Response.ITaskCreateResponse> {
    const feishuMetaData = await taskService.getFeishuTableMetaData(request.feishuTableUrl)
    const task = await taskService.create({
      name: request.name,
      sql: request.sql,
      jsScript: request.jsScript,
      cronExpression: request.cronExpression,
      runMode: request.runMode,
      feishuMetaData: {
        url: request.feishuTableUrl,
        tableId: feishuMetaData.tableId,
        objToken: feishuMetaData.objToken,
      },
      config: request.config,
      creatorName: request.creatorName,
      updaterName: request.updaterName,
    })
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
          runMode: z.nativeEnum(TaskRunMode).optional(),
          cronExpression: z
            .string()
            .refine((val) => isCronExp(val), { message: 'CRON 表达式格式无效，示例: 0 0 * * * *' })
            .optional(),
          feishuTableUrl: z.string().optional(),
          config: z
            .object({
              deleteWholeFeishuTableDataBeforeRun: z.boolean().optional(),
              autoArchiveFeishuTable: z.boolean().optional(),
              archiveFeishuTableConfig: z
                .object({
                  prefixName: z.string().optional(),
                  maxRowCount: z.number().optional(),
                })
                .optional(),
            })
            .optional(),
        })
        .refine((val) => Object.keys(val).length > 0, { message: '至少更新一个字段' }),
    }),
  })
  async update(request: DitingTypes.Request.ITaskUpdateRequest): Promise<void> {
    request.attributes.updaterName = request.operatorName
    const updateAttrs: Partial<TaskEntity> & { feishuTableUrl?: string } = { ...request.attributes }
    delete updateAttrs.feishuTableUrl
    if (request.attributes.feishuTableUrl) {
      const feishuMetaData = await taskService.getFeishuTableMetaData(
        request.attributes.feishuTableUrl,
      )
      updateAttrs.feishuMetaData = {
        url: request.attributes.feishuTableUrl,
        tableId: feishuMetaData.tableId,
        objToken: feishuMetaData.objToken,
      }
    }
    await taskService.update(request.id, updateAttrs)
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
    if (request.status === TaskStatus.ACTIVE) {
      scheduleService.restartJob(request.id)
    } else {
      scheduleService.stopJob(request.id)
    }
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
          // 按创建时间
          createdAt: z.enum(['DESC', 'ASC']).optional(),
          // 按任务名称
          name: z.enum(['DESC', 'ASC']).optional(),
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

  @ZodFunctionValidate({
    request: z.object({
      content: z.string(),
    }),
  })
  async genCronExpression(
    request: DitingTypes.Request.ITaskGenCronExpressionRequest,
  ): Promise<string> {
    if (!request.content) throw new BizError('内容不能为空')
    return taskService.genCronExpression(request.content)
  }

  @ZodFunctionValidate({
    request: z.object({
      url: z.string(),
    }),
  })
  getFeishuTableMetaData(
    request: DitingTypes.Request.ITaskGetFeishuTableMetaDataRequest,
  ): Promise<DitingTypes.Response.IGetFeishuTableMetaDataResponse> {
    return taskService.getFeishuTableMetaData(request.url)
  }

  @ZodFunctionValidate({
    request: z.object({
      id: z.string(),
    }),
  })
  async getDetail(request: { id: string }): Promise<DitingTypes.Dto.TaskDto> {
    const task = await taskService.get(request.id)
    if (!task) {
      throw new BizError('任务不存在')
    }
    return task.dto()
  }

  @ZodFunctionValidate({
    request: z.object({
      taskId: z.string(),
      operatorName: z.string(),
    }),
  })
  delete(request: DitingTypes.Request.ITaskDeleteRequest): Promise<void> {
    return taskService.remove(request.taskId)
  }
}

const taskController = new TaskController()

export default taskController
