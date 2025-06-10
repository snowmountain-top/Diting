import * as lark from '@larksuiteoapi/node-sdk'
import { getRemoteConfig } from '../settings'
import BizError from '../errors/BizError'
import getLogger from '../utils/logger'
import { chunk } from 'lodash'

const logger = getLogger()

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

class FeishuClient {
  private client: lark.Client

  private getClient() {
    if (!this.client) {
      const remoteConfig = getRemoteConfig()
      this.client = new lark.Client({
        appId: remoteConfig.feishu.appId,
        appSecret: remoteConfig.feishu.appSecret,
      })
    }
    return this.client
  }

  /**
   * 查询飞书数据表列表
   */
  async queryAllTableData(objToken: string) {
    const res = await this.getClient().bitable.v1.appTable.list({
      path: {
        app_token: objToken,
      },
      params: {
        page_size: 100,
      },
    })
    if (res.code !== 0) {
      logger.error(`查询飞书数据表列表失败: ${JSON.stringify(res)}`)
      throw new BizError('查询飞书表格列表失败')
    }
    return res.data.items
  }

  /**
   * 查询飞书数据表列数据
   */
  async queryTableColumns(objToken: string, tableId: string) {
    const iterator = await this.getClient().bitable.v1.appTableField.listWithIterator({
      path: { app_token: objToken, table_id: tableId },
    })

    const fields: { field_name: string; field_id: string }[] = []
    for await (const res of iterator)
      fields.push(
        ...res.items.map((item) => {
          return {
            field_name: item.field_name,
            field_id: item.field_id,
            field_type: item.type,
          }
        }),
      )

    return fields
  }

  /**
   * 查询wiki节点元数据
   */
  async getWikiNodeInfo(wikiId: string) {
    const nodeRes = await this.getClient().wiki.v2.space.getNode({
      params: {
        token: wikiId,
        obj_type: 'wiki',
      },
    })
    if (nodeRes.code !== 0) {
      logger.error(`查询飞书文档元数据失败: ${JSON.stringify(nodeRes)}`)
      throw new BizError('获取飞书文档元数据失败, 请检查链接是否正确或"指南针"权限是否正确')
    }
    return nodeRes.data.node
  }

  async getTableMetaDataFromUrl(url: string): Promise<{
    tableId: string
    tableName: string
    viewId: string
    objToken: string
    columnNames: string[]
  }> {
    // DEMO: https://8848-top.feishu.cn/wiki/wikcnUF3sZnNOvUFXHbvh0bVNFg?fromScene=spaceOverview&table=tblVbe0omB0xjf6D&view=vewaDel2YL
    if (url.indexOf('wiki') === -1) {
      throw new BizError('仅支持飞书知识库中的表格, 请检查链接是否正确')
    }
    const urlObj = new URL(url)
    const wikiId = urlObj.pathname.split('/').pop()
    const tableId = urlObj.searchParams.get('table')
    const viewId = urlObj.searchParams.get('view')
    const nodeInfo = await this.getWikiNodeInfo(wikiId)
    const objToken = nodeInfo.obj_token
    const [tableList, columnList] = await Promise.all([
      // 查询所有数据表信息
      this.queryAllTableData(objToken),
      // 查询指定数据表的所有列信息
      this.queryTableColumns(objToken, tableId),
    ])
    const tableInfo = tableList.find((item) => item.table_id === tableId)
    const tableName = tableInfo.name
    if (!tableInfo) {
      throw new BizError('未匹配到指定的表格, 请检查链接是否正确')
    }
    const columnNames = columnList.map((item) => item.field_name)
    return {
      tableId,
      tableName,
      viewId,
      objToken,
      columnNames,
    }
  }

  async insertRecords(
    objToken: string,
    tableId: string,
    records: Record<string, any>[],
    batchInsertCnt = 500,
  ) {
    // 检查表列名是否匹配
    const columnList = await this.queryTableColumns(objToken, tableId)
    const columnNames = columnList.map((item) => item.field_name)
    const recordKeys = Object.keys(records[0])
    if (!recordKeys.every((key) => columnNames.includes(key))) {
      throw new BizError('表列名不匹配, 请检查表格列名是否正确')
    }
    const chunks = chunk(records, batchInsertCnt)
    for (const chunk of chunks) {
      const res = await this.getClient().bitable.v1.appTableRecord.batchCreate({
        path: {
          app_token: objToken,
          table_id: tableId,
        },
        data: {
          records: chunk.map((item) => ({ fields: item })),
        },
      })
      if (res.code !== 0) {
        logger.error(`插入飞书数据表记录失败: ${JSON.stringify(res)}`)
        throw new BizError(`插入飞书数据表记录失败: ${res.code} | ${res.msg}`)
      }
    }
  }

  async readTableData(param: { objToken: string; tableId: string; fieldNames?: string[] }) {
    const iterator = await this.getClient().bitable.v1.appTableRecord.listWithIterator({
      path: { app_token: param.objToken, table_id: param.tableId },
      params: {
        field_names: param.fieldNames?.length ? JSON.stringify(param.fieldNames) : undefined,
      },
    })

    const records: YieldTypeRecord['items'] = []
    for await (const res of iterator) records.push(...(res.items || []))

    return records
  }

  /** 删除原始数据 */
  async deleteOriginalData(param: { objToken: string; tableId: string; recordIds: string[] }) {
    const chunks = chunk(param.recordIds, 500)
    for (const chunkData of chunks) {
      const res = await this.getClient().bitable.v1.appTableRecord.batchDelete({
        path: { app_token: param.objToken, table_id: param.tableId },
        data: { records: chunkData },
      })

      if (res.code !== 0)
        throw new Error(
          `删除原始数据失败，错误信息: ${res.msg}, 错误码: ${res.code}, 请求参数: ${JSON.stringify(
            param,
          )}`,
        )
    }
  }

  /**
   * 删除整个表数据
   */
  async deleteWholeTableData(objToken: string, tableId: string) {
    const wholeTableData = await this.readTableData({
      objToken,
      tableId,
    })
    if (!wholeTableData.length) return

    const recordIds = wholeTableData.map((record) => record.record_id)
    await this.deleteOriginalData({
      objToken,
      tableId,
      recordIds,
    })
  }
}

const feishuClient = new FeishuClient()

export default feishuClient
