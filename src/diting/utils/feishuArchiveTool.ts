import { chunk, defaults, fromPairs, keys } from 'lodash'
import * as lark from '@larksuiteoapi/node-sdk'
import { format } from 'date-fns'
import { getRemoteConfig } from '../settings'
import getLogger from './logger'

const logger = getLogger()

interface IFeishuDocArchiveConfig {
  tableId: string
  objectToken: string
  maxRecordCount: number
  prefixName: string
}
type LarkClient = lark.Client
type GenTypeField = Awaited<
  ReturnType<LarkClient['bitable']['v1']['appTableField']['listWithIterator']>
>
type YieldTypeField = GenTypeField extends {
  [Symbol.asyncIterator]: () => AsyncGenerator<infer T, any, any>
}
  ? T
  : never

type GenTypeRecord = Awaited<
  ReturnType<LarkClient['bitable']['v1']['appTableRecord']['listWithIterator']>
>
type YieldTypeRecord = GenTypeRecord extends {
  [Symbol.asyncIterator]: () => AsyncGenerator<infer T, any, any>
}
  ? T
  : never

export class FeishuArchiveTool {
  protected client: LarkClient
  excludeFieldsType: number[] = [18]
  numberFieldsType: number[] = [2]
  defaultConfig: {
    maxRecordCount?: number
  } = { maxRecordCount: 10000 }

  batchSize: number = 500

  config: IFeishuDocArchiveConfig

  constructor(config: IFeishuDocArchiveConfig) {
    const remoteConfig = getRemoteConfig()
    this.client = new lark.Client({
      appId: remoteConfig.feishu.appId,
      appSecret: remoteConfig.feishu.appSecret,
    })
    this.config = config
    defaults(this.config, this.defaultConfig)
  }

  /** 读取表数据 */
  async readTableData(fieldNames?: string[]) {
    const iterator = await this.client.bitable.v1.appTableRecord.listWithIterator({
      path: { app_token: this.config.objectToken, table_id: this.config.tableId },
      params: { field_names: fieldNames?.length ? JSON.stringify(fieldNames) : undefined },
    })

    const records: YieldTypeRecord['items'] = []
    for await (const res of iterator) records.push(...(res.items || []))

    return records
  }

  /** 创建归档表 */
  async createArchiveTable(param: {
    fields: YieldTypeField['items']
    tableName: string
    viewName: string
  }) {
    const res = await this.client.bitable.v1.appTable.create({
      path: { app_token: this.config.objectToken },
      data: {
        table: {
          name: param.tableName,
          default_view_name: param.viewName,
          fields: param.fields.map((field) => ({
            ...field,
            description: { disable_sync: true, text: field.description || '' },
          })),
        },
      },
    })

    if (res.code !== 0)
      throw new Error(
        `创建归档表失败，错误信息: ${res.msg},错误码: ${res.code}, 请求参数: ${JSON.stringify(
          this.config,
        )}`,
      )

    return res.data.table_id
  }

  /** 插入归档数据 */
  async insertArchiveData(param: { archiveTableId: string; records: YieldTypeRecord['items'] }) {
    const chunks = chunk(param.records, this.batchSize)
    for (const chunkData of chunks) {
      const res = await this.client.bitable.v1.appTableRecord.batchCreate({
        path: { app_token: this.config.objectToken, table_id: param.archiveTableId },
        data: { records: chunkData.map((record) => ({ fields: record.fields })) },
      })

      if (res.code !== 0)
        throw new Error(
          `插入归档数据失败，错误信息: ${res.msg}, 错误码: ${res.code}, 请求参数: ${JSON.stringify(
            this.config,
          )}`,
        )
    }
  }

  /** 删除原始数据 */
  async deleteOriginalData(recordIds: string[]) {
    const chunks = chunk(recordIds, this.batchSize)
    for (const chunkData of chunks) {
      const res = await this.client.bitable.v1.appTableRecord.batchDelete({
        path: { app_token: this.config.objectToken, table_id: this.config.tableId },
        data: { records: chunkData },
      })

      if (res.code !== 0)
        throw new Error(
          `删除原始数据失败，错误信息: ${res.msg}, 错误码: ${res.code}, 请求参数: ${JSON.stringify(
            this.config,
          )}`,
        )
    }
  }

  /** 获取总数 */
  async getTotalCount() {
    const res = await this.client.bitable.v1.appTableRecord.list({
      path: { app_token: this.config.objectToken, table_id: this.config.tableId },
      params: { page_size: 1 },
    })

    if (res.code !== 0)
      throw new Error(
        `获取多维表总数失败，错误信息: ${res.msg},错误码: ${res.code}, 请求参数: ${JSON.stringify(
          this.config,
        )}`,
      )

    return res.data.total
  }

  /** 获取字段 */
  async getFields() {
    const iterator = await this.client.bitable.v1.appTableField.listWithIterator({
      path: { app_token: this.config.objectToken, table_id: this.config.tableId },
    })

    const fields: YieldTypeField['items'] = []
    for await (const res of iterator) fields.push(...res.items)

    return fields
  }

  /** 获取表名称 */
  async getTableName() {
    const iterator = await this.client.bitable.v1.appTable.listWithIterator({
      path: { app_token: this.config.objectToken },
    })

    for await (const res of iterator) {
      if (res.items.find((item) => item.table_id === this.config.tableId))
        return res.items.find((item) => item.table_id === this.config.tableId)?.name
    }
    return this.config.tableId
  }

  /** 是否需要归档 */
  isNeedArchive(param: { totalCount: number }) {
    return param.totalCount > this.config.maxRecordCount
  }

  /** 数据类型转换 */
  convertData(param: { fieldMap: Record<string, number>; records: YieldTypeRecord['items'] }) {
    param.records.forEach((record) => {
      for (const key in record.fields) {
        if (this.numberFieldsType.includes(param.fieldMap[key]))
          record.fields[key] = Number(record.fields[key])
      }
    })
  }

  /** 归档入口 */
  async archive() {
    const totalCount = await this.getTotalCount()

    const isNeedArchive = this.isNeedArchive({ totalCount })
    if (!isNeedArchive) {
      logger.info(`未到自动归档行数, 暂不归档`)
      return
    }

    const fields = await this.getFields()

    // 过滤掉不需要归档的字段
    const archiveFields = fields.filter((field) => !this.excludeFieldsType.includes(field.type))
    const timeStr = format(Date.now(), 'yyyy-MM-dd_HH:mm')
    const tableName = `${this.config.prefixName}_${timeStr}`
    const viewName = '默认视图'
    const fieldMap = fromPairs(archiveFields.map((field) => [field.field_name, field.type]))

    const [archiveTableId, records] = await Promise.all([
      this.createArchiveTable({ fields: archiveFields, tableName, viewName }),
      this.readTableData(keys(fieldMap)),
    ])

    this.convertData({ fieldMap, records })

    await this.insertArchiveData({ archiveTableId, records })

    await this.deleteOriginalData(records.map((record) => record.record_id))
  }
}
