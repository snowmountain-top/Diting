require('express-async-errors')
import express from 'express'
import envConfig from '../settings'
import rTracer from 'cls-rtracer'

// 堆栈信息转换
import * as sourceMapSupport from 'source-map-support'
sourceMapSupport.install()

// 启动远程配置模块
import * as remoteConfig from '../utils/remoteConfig'
remoteConfig.register()

import TargetSourceConsumerClassList from './demoSourceConsumer'
import AsyncActionConsumerClassList from './asyncTask'

const TotalConsumeClassList = [...TargetSourceConsumerClassList, ...AsyncActionConsumerClassList]

for (const ConsumerClass of TotalConsumeClassList) {
  const consumer = new ConsumerClass()
  consumer.startConsumer()
}

// =============================== 启动心跳检查服务 =================================

const heartbeatApp = express()

// 使用rTracer，为了在请求链路中生成追踪Id
heartbeatApp.use(rTracer.expressMiddleware({ useHeader: true, headerName: 'X-Request-Id' }))

heartbeatApp.get('/', (req, res) => {
  res.status(200).send('OK')
})

heartbeatApp.listen(envConfig.CONSUMER_PORT, () => {
  console.info(`Heartbeat Server is running on port ${envConfig.CONSUMER_PORT}`)
})
