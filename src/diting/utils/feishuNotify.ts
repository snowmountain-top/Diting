import { Response, Request } from 'ultimate-express'
import envUtils from './env'
import envConfig from '../settings'
import axios, { AxiosError } from 'axios'
import getLogger from './logger'
import { format } from 'date-fns'
import * as rTracer from 'cls-rtracer'
import bizTokenScf from '../vendors/bizTokenScf'

const _LOGGER = getLogger()

export enum FeishuGroup {
  ASYNC_TASK = 'https://open.feishu.cn/open-apis/bot/v2/hook/6f509075-dbae-48ca-8987-ed151442fca1',
}

class FeishuNotify {
  private notifyUrl: string = envUtils.isProduction()
    ? 'https://open.feishu.cn/open-apis/bot/v2/hook/f3c36bf5-b463-464e-b9b4-617fa6bd6fb6'
    : 'https://open.feishu.cn/open-apis/bot/v2/hook/c65badba-562f-48cf-8f58-945eb013610a'

  /** 组装飞书要求的消息结构题 */
  private getMessageStructure(message: string, title: { value: string; color: string }) {
    return {
      msg_type: 'interactive',
      card: {
        config: { wide_screen_mode: true, enable_forward: true },
        elements: [
          {
            tag: 'div',
            text: { content: message, tag: 'lark_md' },
          },
        ],
        header: {
          template: title.color,
          title: {
            content: title.value,
            tag: 'plain_text',
          },
        },
      },
    }
  }

  /** 发送飞书消息告警 */
  private async sendMessage(
    content: string,
    title: { value: string; color: string },
    groupName?: FeishuGroup,
  ) {
    const structure = this.getMessageStructure(content, title)
    let notifyUrl
    if (envUtils.isProduction()) {
      notifyUrl = groupName && FeishuGroup[groupName] ? FeishuGroup[groupName] : this.notifyUrl
    } else {
      notifyUrl = this.notifyUrl
    }
    try {
      await axios({
        url: notifyUrl,
        method: 'POST',
        data: structure,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 3000,
        timeoutErrorMessage: '飞书告警请求3s超时',
      })
    } catch (error) {
      if (error instanceof AxiosError) _LOGGER.error(JSON.stringify(error.toJSON()))
      throw error
    }
  }

  /** 异常飞书告警 */
  error(err: Error, request: Request, response: Response) {
    const msgContent = `
**【time】**: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS')}
**【path】**: ${request.path}
**【body】**: ${JSON.stringify(request.body)}
**【traceId】**: ${rTracer.id()}
**【stack】**:
${err.stack || '无堆栈信息'}`

    this.sendMessage(msgContent, { value: `${envConfig.PROJECT_NAME} 告警`, color: 'red' })
    this.insertAlertTable(err, request)
  }

  buildExceptionTableData(
    err: Error,
    request: Request,
  ): {
    datetime: number
    platform: string
    traceId: string
    module: string
    stack: string
    param: string
  } {
    return {
      datetime: Date.now(),
      platform: envConfig.PROJECT_NAME,
      traceId: rTracer.id() as string,
      module: request.path,
      stack: err.stack ? err.stack : '无堆栈信息',
      param: JSON.stringify(request.body),
    }
  }

  async insertAlertTable(err: Error, request: Request) {
    if (!envUtils.isProduction()) return
    const data = this.buildExceptionTableData(err, request)
    const feishuToken = await bizTokenScf.getFeiShuTenantAccessToken()
    const tableId = 'tbls4peoVEtZKoYP'
    const objToken = 'bascnYdu7oAJZ1Rg0f42pondjZg'
    try {
      await axios({
        url: `https://open.feishu.cn/open-apis/bitable/v1/apps/${objToken}/tables/${tableId}/records`,
        method: 'post',
        data: {
          fields: data,
        },
        headers: {
          Authorization: 'Bearer ' + feishuToken,
          'Content-Type': 'application/json; charset=utf-8',
        },
        responseType: 'json',
      })
    } catch (err) {
      const errData = {
        message: '飞书告警表插入失败',
        stack: err.stack,
        responseData: err.response?.data,
      }
      _LOGGER.error(errData)
    }
  }

  /** 手动告警 */
  manualNotify(content: string, groupName?: FeishuGroup) {
    this.sendMessage(content, { value: '手动通知', color: 'yellow' }, groupName)
  }
}

const feishuNotifyInstance = new FeishuNotify()

export default feishuNotifyInstance
