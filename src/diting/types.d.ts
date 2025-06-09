import { TaskStatus, TaskRecordStatus, TaskRunMode } from './enum'

export namespace DitingTypes {
  export namespace Dto {
    export interface TaskDto {
      /** 任务ID */
      id: string
      /** 任务名称 */
      name: string
      /** 任务状态 */
      status: TaskStatus
      /** 运行方式 */
      runMode: TaskRunMode
      /** SQL语句 */
      sql: string
      /** JavaScript脚本 */
      jsScript: string
      /** CRON表达式 */
      cronExpression: string
      /** 创建者 */
      creatorName: string
      /** 更新者 */
      updaterName: string
      /** 飞书表元数据 */
      feishuMetaData: {
        url: string
        tableId: string
        objToken: string
      }
      /** 创建时间 */
      createdAt: number
      /** 更新时间 */
      updatedAt: number
      /** 删除时间 */
      deletedAt: number
    }

    export interface TaskRecordDto {
      /** 记录ID */
      id: string
      /** 关联任务ID */
      taskId: string
      /** 任务执行时间 */
      executionTime: number
      /** 任务状态 */
      status: TaskRecordStatus
      /** SQL语句 */
      sql: string
      /** JavaScript脚本 */
      jsScript: string
      /** 飞书表元数据 */
      feishuMetaData: TaskDto['feishuMetaData']
      /** CRON表达式 */
      cronExpression: string
      /** 运行方式 */
      runMode: TaskRunMode
      /** 执行时长(秒) */
      durationSec: number
      /** 错误日志 */
      errorLog: string
      /** 创建时间 */
      createdAt: number
      /** 更新时间 */
      updatedAt: number
      /** 删除时间 */
      deletedAt: number
    }
  }

  export namespace Request {
    export type ITaskCreateRequest = {
      /** 任务名称 */
      name: string
      /** SQL语句 */
      sql: string
      /** JavaScript脚本 */
      jsScript: string
      /** CRON表达式 (格式: 0 0 * * * *) */
      cronExpression: string
      /** 运行方式 */
      runMode: TaskRunMode
      /** 飞书表元数据 */
      feishuTableUrl: string
      /** 创建者 */
      creatorName: string
      /** 更新者 */
      updaterName: string
    }

    export type ITaskUpdateRequest = {
      id: string
      operatorName: string
      attributes: Partial<Omit<ITaskCreateRequest, ['creatorName', 'updaterName', 'runMode']>>
    }

    export type ITaskChangeStatusRequest = {
      id: string
      operatorName: string
      status: TaskStatus
    }

    export interface ITaskQueryRequest {
      /** 任务名称 */
      name?: string
      /** 任务状态 */
      status?: TaskStatus[]
      /** 页码 */
      pageIndex: number
      /** 每页大小 */
      pageSize: number
      /** 排序 */
      sort?: {
        createdAt?: 'DESC' | 'ASC'
      }
    }

    export interface ITaskRecordQueryRequest {
      /** 任务ID */
      taskId: string
      /** 页码 */
      pageIndex: number
      /** 每页大小 */
      pageSize: number
    }

    export interface ITaskManualRunRequest {
      /** 任务ID */
      taskId: string
      /** 执行人 */
      executorName: string
    }

    export interface ITaskGenCronExpressionRequest {
      /** 任务描述 */
      content: string
    }

    export interface ITaskGetFeishuTableMetaDataRequest {
      /** 飞书表格url */
      url: string
    }
  }

  export namespace Response {
    export interface ITaskCreateResponse {
      /** 任务ID */
      id: string
    }

    export interface ITaskQueryResponse {
      /** 任务列表 */
      data: Dto.TaskDto[]
      /** 总条数 */
      total: number
    }

    export interface ITaskRecordQueryResponse {
      /** 任务记录列表 */
      data: Dto.TaskRecordDto[]
      /** 总条数 */
      total: number
    }

    export interface IGetFeishuTableMetaDataResponse {
      /** 表格Id */
      tableId: string
      /** 表格名称 */
      tableName: string
      /** 视图Id */
      viewId: string
      /** ObjectToken */
      objToken: string
      /** 表头 */
      columnNames: string[]
    }
  }

  export interface ITaskController {
    /** 创建任务 */
    create(request: Request.ITaskCreateRequest): Promise<Response.ITaskCreateResponse>
    /** 更新任务 */
    update(request: Request.ITaskUpdateRequest): Promise<void>
    /** 查询任务详情 */
    getDetail(request: { id: string }): Promise<Dto.TaskDto>
    /** 改变任务状态 */
    changeStatus(request: Request.ITaskChangeStatusRequest): Promise<void>
    /** 查询任务列表 */
    query(request: Request.ITaskQueryRequest): Promise<Response.ITaskQueryResponse>
    /** 手动执行任务 */
    manualRun(request: Request.ITaskManualRunRequest): Promise<void>
    /** AI推导cron表达式 */
    genCronExpression(request: Request.ITaskGenCronExpressionRequest): Promise<string>
    /** 根据飞书表格url获取表格元数据 */
    getFeishuTableMetaData(
      request: Request.ITaskGetFeishuTableMetaDataRequest,
    ): Promise<Response.IGetFeishuTableMetaDataResponse>
  }

  export interface ITaskRecordController {
    /** 根据任务查询记录 */
    queryByTaskId(
      request: Request.ITaskRecordQueryRequest,
    ): Promise<Response.ITaskRecordQueryResponse>
  }
}
