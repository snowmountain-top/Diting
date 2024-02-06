require('express-async-errors')
import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import rTracer from 'cls-rtracer'
import envConfig from '../settings'
import * as remoteConfig from '../utils/remoteConfig'

// 堆栈信息转换
import * as sourceMapSupport from 'source-map-support'

import { logResponseRes, errorLogger } from './middleware/logger'
import demoApplicationRouter from './routes/demoApplication'
import { injectUserInfo } from './middleware/injectUserInfo'

sourceMapSupport.install()

async function main() {
  // 启动远程配置模块
  await remoteConfig.register()

  const app = express()

  // 使用rTracer，为了在请求链路中生成追踪Id
  app.use(rTracer.expressMiddleware({ useHeader: true, headerName: 'X-Request-Id' }))

  // post body 按照JSON解析
  app.use(bodyParser.json())

  // 解析urlencoded form data
  app.use(bodyParser.urlencoded({ extended: false }))

  // 服务请求日志输出
  app.use(logResponseRes())

  // 注入用户信息
  app.use(injectUserInfo())

  // 路由 - demo
  app.use('/demo', demoApplicationRouter)

  app.get('/', async function (req: Request, res: Response) {
    res.json({ message: 'Hello World' })
  })

  // 全局异常日志
  app.use(errorLogger())

  // 处理未处理的路由
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: 'URL not found' })
  })

  const server = app.listen(envConfig.API_PORT, () => {
    console.log(`Server running on port ${envConfig.API_PORT}`)
  })

  // 设置tcp连接超时时长
  server.keepAliveTimeout = 61 * 1000
  server.headersTimeout = 65 * 1000
}

main()
