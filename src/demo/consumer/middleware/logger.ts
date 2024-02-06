import express from 'express'
import getLogger from '../../utils/logger'

const LOGGER = getLogger()

// 响应体标准日志结构输出
export function responseLogger() {
  return function (req: any, res: any, next: Function) {
    req._startTime = Date.now()

    // 重写res.send方法
    const originalSendFunc = res.send
    res.send = function (body, ...args: any): any {
      // 打印res.send的返回值
      LOGGER.info({
        message: '接口返回值',
        result: body,
      })
      res.send = originalSendFunc
      return originalSendFunc.apply(res, [body, ...args])
    }

    const apiContext = {
      url: req.url,
      headers: JSON.stringify(req.headers),
      queryParams: JSON.stringify(req.params),
      body: JSON.stringify(req.body),
      ip: req.ip,
      timeCost: 0,
    }
    const calResponseTime = function () {
      const now = Date.now()
      const deltaTime = now - req._startTime
      apiContext.timeCost = deltaTime
      // 输出日志
      LOGGER.info(apiContext)
    }
    res.once('finish', calResponseTime)
    return next()
  }
}

// 全局异常处理
export function errorLogger() {
  return function (err: any, request: express.Request, response: express.Response, next: Function) {
    // 触发飞书通知
    return response.status(500).json({ data: null, meta: { status: 500, msg: err.message } })
  }
}
