import z from 'zod'
import { DitingTypes } from '../../types'
import { ZodFunctionValidate } from '../../utils/ZodFunctionValidate'
import taskRecordService from '../../core/modules/taskRecord/service'

class TaskRecordController implements DitingTypes.ITaskRecordController {
  @ZodFunctionValidate({
    request: z.object({
      taskId: z.string(),
      pageIndex: z.number().refine((u) => u > 0, { message: 'pageIndex 必须大于 0' }),
      pageSize: z
        .number()
        .refine((u) => u > 0 && u <= 100, { message: 'pageSize 必须大于 0 且 小于等于 100' }),
    }),
  })
  async queryByTaskId(
    request: DitingTypes.Request.ITaskRecordQueryRequest,
  ): Promise<DitingTypes.Response.ITaskRecordQueryResponse> {
    const { data, total } = await taskRecordService.queryByTaskId(request)
    return {
      data: data.map((tr) => tr.dto()),
      total,
    }
  }
}

const taskRecordController = new TaskRecordController()

export default taskRecordController
