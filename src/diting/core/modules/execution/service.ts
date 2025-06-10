import vm from 'vm'
import TaskRecordEntity from '../../entity/TaskRecord'
import belinkRepository from '../../repository/database/belink'
import getLogger from '../../../utils/logger'
import feishuClient from '../../../vendors/feishuClient'

const logger = getLogger()

class ExecutionService {
  async fetchRemoteData(taskRecord: TaskRecordEntity) {
    return belinkRepository.query(taskRecord.sql)
  }

  async executeJsScript(taskRecord: TaskRecordEntity, data: any[]) {
    if (!taskRecord.jsScript) return data

    const wrappedScript = `(function() { ${taskRecord.jsScript} })()`
    const jsScript = new vm.Script(wrappedScript)
    try {
      return jsScript.runInNewContext({ data, logger }, { timeout: 5000 })
    } catch (error) {
      logger.error('执行js脚本失败', error)
      throw error
    }
  }

  async run(taskRecord: TaskRecordEntity) {
    // 执行SQL语句查询源数据
    const originData = await this.fetchRemoteData(taskRecord)
    logger.info(`[${taskRecord.id}]已成功查询到 ${originData.length} 条源数据`)
    // 执行JavaScript脚本处理数据
    const processedData = await this.executeJsScript(taskRecord, originData)
    logger.info(`[${taskRecord.id}]已成功处理 ${processedData.length} 条数据`)
    // 推数前操作
    if (taskRecord.config.deleteWholeFeishuTableDataBeforeRun) {
      // 删除飞书表格所有数据
      await feishuClient.deleteWholeTableData(
        taskRecord.feishuMetaData.objToken,
        taskRecord.feishuMetaData.tableId,
      )
      logger.info(
        `[${taskRecord.id}]已成功删除飞书表格[${taskRecord.feishuMetaData.tableId}]所有数据`,
      )
    }
    // 插入飞书表格
    const feishuMetaData = taskRecord.feishuMetaData
    await feishuClient.insertRecords(feishuMetaData.objToken, feishuMetaData.tableId, processedData)
    logger.info(
      `[${taskRecord.id}]已成功插入 ${processedData.length} 条数据到飞书表格[${feishuMetaData.tableId}]`,
    )
  }
}

const executionService = new ExecutionService()

export default executionService
