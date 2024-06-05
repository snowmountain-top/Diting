import * as jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import getLogger from '../../utils/logger'
import * as memoryCache from 'memory-cache'
import CryptoJS from 'crypto-js'
import globalConfig from '../../config/globalConfig'
import envConfig, { CacheConfig } from '../../settings'

const LOGGER = getLogger()
// 路由白名单
const whiteListInterface = []

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const accessType = req.headers['x-belink-accesstype']
  const authorization = req.headers['x-belink-authorization'] as string
  const reqIp = req.headers['x-original-forwarded-for'] as string
  // 判断白名单
  if (whiteListInterface.includes(req.originalUrl)) {
    LOGGER.info(`白名单:${req.originalUrl}`)
    next()
    return
  }

  LOGGER.info(`入口getServerTokenSwitch:${globalConfig.serverTokenSwitch}`)
  if (
    globalConfig.serverTokenSwitch === 0 ||
    (globalConfig.serverTokenSwitch === -1 && !authorization)
  ) {
    LOGGER.info(`不校验权限Ip:${reqIp}`)
    next()
    return
  }

  if (
    globalConfig.serverTokenSwitch === 1 ||
    (globalConfig.serverTokenSwitch === -1 && authorization)
  ) {
    // 判断是否为内部调用  --- 直接校验redis里面的数据
    if (accessType && accessType === 'authorizationTokenInside') {
      LOGGER.info(`内部部调用:${accessType}`)
      const tokenKeyForWard = globalConfig.tokenKeyForWard
      const tokenKey = globalConfig.tokenKey
      const tokenKeyBackUp = globalConfig.tokenKeyBackUp
      LOGGER.info(`tokenKey和tokenKeyBackUp:${tokenKey}，${tokenKeyBackUp}`)

      if ([tokenKeyForWard, tokenKey, tokenKeyBackUp].includes(authorization)) {
        LOGGER.info(`函数内部调用--放行:${req.headers.accessType}`)
        next()
        return
      }
      LOGGER.info(`函数内部调用--token不正确:${authorization}`)
      return
    }

    LOGGER.info(`外部部调用:${authorization}`)
    if (!authorization) return res.status(401).json({ message: 'Authorization token is required' })

    const decodedRes = await decryptData(authorization)
    LOGGER.info(`入口decodedToken:${decodedRes}`)

    // 判断时间戳是否过期 15秒过期时间
    if (decodedRes.timeStamp + Number(globalConfig.outOfTimeTimeStamp) < new Date().getTime())
      return res.status(401).json({ message: 'Invalid token' })

    const cachedObject: CacheConfig = memoryCache.get(envConfig.CONFIGURATION_KEY)
    jwt.verify(
      decodedRes.originToken,
      cachedObject.JWT_SECRET,
      (
        err,
        decoded: {
          unionId: string
          openId: string
          appId: string
        },
      ) => {
        if (err) return res.status(401).json({ message: 'Invalid token' })

        LOGGER.info(`解析后的结果:${JSON.stringify(decoded)}`)
        req.headers.unionId = decoded.unionId
        req.headers.openId = decoded.openId
        req.headers.appId = decoded.appId
        next()
      },
    )
  }
}

// 解密函数
/**
 * 解密后结果 token + |+| + timeStamp
 * @param encryptedData
 */
async function decryptData(encryptedData: string): Promise<{
  originToken: string
  timeStamp: number
}> {
  const cacheConfig: CacheConfig = memoryCache.get('configuration_detail')

  const decryptedText = CryptoJS.AES.decrypt(
    encryptedData,
    cacheConfig.DECRYPT_DATA_SECRET,
  ).toString(CryptoJS.enc.Utf8)
  console.log('解密后的文本:', decryptedText)

  LOGGER.info(`解码后的字符串:${decryptedText}`)
  const tokenSplit = decryptedText.split('|+|')
  const originToken = tokenSplit[0]
  const timeStamp = Number(tokenSplit[1])
  return { originToken, timeStamp }
}
