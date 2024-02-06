/**
 * 日志辅助类
 * usage:
 *  const logger = getLogger()
 *
 *  function A(){
 *     logger.info('something...')
 *     logger.error('boom', new Error())
 *  }
 */

import * as rTracer from 'cls-rtracer'
import * as clsSdk from 'tencentcloud-cls-sdk-js'
import envConfig from '../settings'
import envUtils from './env'
import consumerAsyncLocalStorage from './consumerAsyncLocalStorage'

class Logger {
  private client: clsSdk.AsyncClient
  private topicId: string

  constructor() {
    this.topicId = envUtils.isProduction()
      ? 'ecfe71f0-fafe-4a12-9e04-fa4ca5b1e7a4'
      : 'f7287f24-8115-4e63-8bcc-df5abb3288eb'
  }

  private initLogClient() {
    if (!this.client) {
      this.client = new clsSdk.AsyncClient({
        endpoint: 'ap-shanghai.cls.tencentcs.com',
        secretId: envConfig.TENCENT_SECRET_ID,
        secretKey: envConfig.TENCENT_SECRET_KEY,
        sourceIp: '127.0.0.1',
        retry_times: 3,
      })
    }
  }

  /**
   * 组装上报的context
   */
  private composeContext(content: { [key: string]: any } | string): {
    [key: string]: any
  } {
    let context = null
    if (typeof content === 'string') {
      context = {
        message: content,
      }
    } else {
      context = content
    }
    return context
  }

  private async pushContext(context: { [key: string]: any }) {
    this.initLogClient()
    try {
      if (!context) {
        throw new Error('入参不允许为空')
      }
      if (Object.prototype.toString.call(context) !== '[object Object]') {
        throw new Error('参数类型必须为Object{}')
      }
      const item = new clsSdk.LogItem()
      for (const key in context) {
        let value = context[key]
        if (typeof value !== 'string') {
          // value为undefined时，需要额外处理
          value = JSON.stringify(value) || 'undefined'
        }
        item.pushBack(new clsSdk.Content(key, value))
      }
      // 不管什么日志，统一在上报时增加requestId
      item.pushBack(new clsSdk.Content('requestId', String(rTracer.id())))
      if (consumerAsyncLocalStorage.traceMessageId) {
        item.pushBack(
          new clsSdk.Content('traceMessageId', consumerAsyncLocalStorage.traceMessageId),
        )
      }
      item.setTime(Date.now())
      const logGroup = new clsSdk.LogGroup()
      logGroup.addLogs(item)
      const request = new clsSdk.PutLogsRequest(this.topicId, logGroup)
      this.client.PutLogs(request).catch((err) => {
        console.error('日志输出异常: ', JSON.stringify(context), err)
      })
    } catch (err) {
      console.error('日志输出异常: ', JSON.stringify(context), err)
    }
  }

  /**
   * 输出普通级别信息
   * @param content 日志输出内容, 可为对象或字符串
   * @returns
   */
  public async info(content: { [key: string]: any } | string) {
    const context = this.composeContext(content)
    context.level = 'info'
    console.info(JSON.stringify(context))
    this.pushContext(context)
  }

  /**
   * 输出警告级别信息
   * @param content 日志输出内容, 可为对象或字符串
   * @returns
   */
  public async warn(content: { [key: string]: any } | string) {
    const context = this.composeContext(content)
    context.level = 'warning'
    console.warn(JSON.stringify(context))
    this.pushContext(context)
  }

  /**
   * 输出错误级别信息
   * @param content 日志输出内容, 可为对象或字符串
   * @param err 可选, 异常对象
   */
  public async error(content: { [key: string]: any } | string, err?: Error) {
    const context = this.composeContext(content)
    context.level = 'error'
    if (err) {
      context.errName = err.name
      context.errMessage = err.message
      context.errStack = err.stack
    }
    console.error(err?.stack)
    this.pushContext(context)
  }
}

export default function getLogger(): Logger {
  return new Logger()
}
