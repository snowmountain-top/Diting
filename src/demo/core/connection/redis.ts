import Redis from 'ioredis'
import envConfig from '../../settings'

const globalLuaConfig = {
  demo: {
    numberOfKeys: 1,
    lua: `
      return 1
    `,
  },
}

let _REDIS_INSTANCE:
  | (Redis & { [K in keyof typeof globalLuaConfig]?: (...args: any[]) => any })
  | null = null
// 获取redis实例
export function getRedisInstance(db: number = envConfig.REDIS_DB) {
  if (!_REDIS_INSTANCE) {
    _REDIS_INSTANCE = new Redis(envConfig.REDIS_PORT, envConfig.REDIS_HOST, {
      password: envConfig.REDIS_PASSWORD,
      db,
    })
    setupLuaScript(_REDIS_INSTANCE)
  }
  return _REDIS_INSTANCE
}

// 设置lua脚本
export function setupLuaScript(redisInstance: Redis, luaConfig = globalLuaConfig) {
  for (const [key, value] of Object.entries(luaConfig)) {
    redisInstance.defineCommand(key, value)
  }
}

const redisInstance = getRedisInstance()

export default redisInstance
