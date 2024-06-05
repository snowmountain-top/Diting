import Redis from 'ioredis'
import envConfig, { CacheConfig } from '../../settings'
import * as memoryCache from 'memory-cache'
const globalLuaConfig = {
  demo: {
    numberOfKeys: 1,
    lua: `
      return 1
    `,
  },
}

let _REDIS_INSTANCE: Redis & { [K in keyof typeof globalLuaConfig]?: (...args: any[]) => any } =
  null
// 获取redis实例
export function getRedisInstance(db: number = envConfig.REDIS_DB) {
  const cachedObject: CacheConfig = memoryCache.get(envConfig.CONFIGURATION_KEY)
  if (!_REDIS_INSTANCE) {
    _REDIS_INSTANCE = new Redis(cachedObject.redisDatabase.port, cachedObject.redisDatabase.host, {
      password: cachedObject.redisDatabase.password,
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
const redisInstance = new Proxy(
  {},
  {
    get(target, prop, receiver) {
      return Reflect.get(_REDIS_INSTANCE, prop, receiver)
    },
  },
)

export async function setRedisInstance() {
  getRedisInstance()
}

// export default redisInstanceWrapper.getInstance()
export default redisInstance as Redis & {
  [K in keyof typeof globalLuaConfig]?: (...args: any[]) => any
}
