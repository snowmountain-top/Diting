import * as authSDK from '@be-link/auth-sdk'
import { getRemoteConfig } from '../../settings'
import globalConfig from '../../core/config/globalConfig'

// 路由白名单
const whiteListInterface = []

export function authMiddleware() {
  const remoteConfig = getRemoteConfig()
  return authSDK.createAuthMiddleware({
    globalConfig,
    whiteListInterface,
    config: {
      JWT_SECRET: remoteConfig.jwtSecret,
      DECRYPT_DATA_SECRET: remoteConfig.decryptDataSecret,
      DECRYPT_DATA_OFFSET: remoteConfig.decryptDataOffset,
      DECRYPT_DATA_SECRET_NEW: remoteConfig.decryptDataSecretNew,
    },
  })
}
