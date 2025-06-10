// 第三方模块导入
import bodyParser from 'body-parser'
import rTracer from 'cls-rtracer'
import cors from 'cors'
import express, { Request, Response } from 'ultimate-express'
import * as sourceMapSupport from 'source-map-support'

// 业务模块导入
import * as databaseService from '../core/connection/database'
import * as redisService from '../core/connection/redis'
import envConfig, { fetchRemoteConfig } from '../settings'
import * as remoteConfig from '../core/config/remoteConfig'
import { authMiddleware } from './middleware/auth'
import { errorLogger, logResponseRes } from './middleware/logger'

// 路由
import taskRouter from './routes/task'
import taskRecordRouter from './routes/taskRecord'
import scheduleService from '../core/modules/schedule/service'

sourceMapSupport.install()

async function main() {
  await fetchRemoteConfig()

  // 启动时初始化数据源
  await databaseService.init()
  await redisService.setRedisInstance()

  // 启动远程配置模块
  await remoteConfig.register()

  const app = express()

  // 捕获异步错误
  app.set('catch async errors', true)

  // 跨域
  app.use(cors())

  // 使用rTracer，为了在请求链路中生成追踪Id
  app.use(rTracer.expressMiddleware({ useHeader: true, headerName: 'X-Request-Id' }))

  // post body 按照JSON解析
  app.use(bodyParser.json())

  // 解析urlencoded form data
  app.use(bodyParser.urlencoded({ extended: false }))

  // 服务请求日志输出
  app.use(logResponseRes())

  // 路由 - 任务
  app.use('/task', authMiddleware, taskRouter)
  // 路由 - 任务记录
  app.use('/task-record', authMiddleware, taskRecordRouter)

  app.get('/', async function (req: Request, res: Response) {
    res.json({ message: 'Hello World' })
  })

  // 全局异常日志
  app.use(errorLogger())

  // 处理未处理的路由
  app.use(async (req: Request, res: Response) => {
    res.status(404).json({ message: 'URL not found' })
  })

  const server = app.listen(envConfig.API_PORT, () => {
    console.log(`Server running on port ${envConfig.API_PORT}`)
  })

  // 设置tcp连接超时时长
  server.keepAliveTimeout = 61 * 1000
  server.headersTimeout = 65 * 1000

  // 启动定时任务
  scheduleService.startAllJobs()
}

main()
