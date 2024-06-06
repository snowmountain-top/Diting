// 引入初始化的 mock 数据需要mock测试方法中对外部的依赖
import '../utils/initMock'
// import * as cosService from '../../src/demo/utils/cos'
// import envConfig from '../../src/demo/settings'
// import * as memoryCache from 'memory-cache'
// import * as redisService from '../../src/demo/core/connection/redis'
// import * as databaseService from '../../src/demo/core/connection/database'
// import * as remoteConfig from '../../src/demo/utils/remoteConfig'

// beforeAll(async () => {
//   const cosInfo = await cosService.getObject(envConfig.CONFIGURATION_KEY)
//   // 将对象放入内存缓存中
//   if (cosInfo) memoryCache.put(envConfig.CONFIGURATION_KEY, cosInfo)

//   // 启动时初始化数据源
//   await databaseService.init()
//   await redisService.setRedisInstance()

//   // 启动远程配置模块
//   await remoteConfig.register()
// })

describe('demo', () => {
  it('should do something', () => {
    expect(true).toBe(true)
  })
})
