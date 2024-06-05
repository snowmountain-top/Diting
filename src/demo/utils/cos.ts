/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-var-requires
import COS from 'cos-nodejs-sdk-v5'
import envConfig from '../settings'
// import envUtils from 'vitality-sdk/utils/env-utils';

const env = process.env
// const { default: envUtils } = require('vitality-sdk/utils/env-utils')
const SECRET_ID = env.COS_SECRET_ID || 'AKIDzw0tjuPbbhfPvDO2TgGk00mTUEfjkp0v'
const SECRET_KEY = env.COS_SECRET_KEY || 'xtjX6xZv4QE4lKNK44qyDFacq9MExW0f'

/**
 * 上传图片到云存储桶
 */
interface BucketsConfig {
  [key: string]: {
    name: string
    host: string
    protocol: string
  }
}

const BUCKETS_CONFIG: BucketsConfig = {
  development: {
    name: 'dev-1304510571',
    host: 'dev-1304510571.cos.ap-nanjing.myqcloud.com',
    protocol: 'https',
  },
  ppe: {
    name: 'dev-1304510571',
    host: 'dev-1304510571.cos.ap-nanjing.myqcloud.com',
    protocol: 'https',
  },
  test: {
    name: 'dev-1304510571',
    host: 'dev-1304510571.cos.ap-nanjing.myqcloud.com',
    protocol: 'https',
  },
  prod: {
    name: 'release-1304510571',
    host: 'release-1304510571.cos.ap-nanjing.myqcloud.com',
    protocol: 'https',
  },
}

const _COS_CLIENT = new COS({
  SecretId: SECRET_ID,
  SecretKey: SECRET_KEY,
})

export const getObject = async (key: string): Promise<any> => {
  const NODE_ENV = envConfig.NODE_ENV
  const config = BUCKETS_CONFIG[NODE_ENV]
  return new Promise((resolve, reject) => {
    _COS_CLIENT.getObject({ Key: key, Bucket: config.name, Region: 'ap-nanjing' }, (err, data) => {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        const jsonContent = JSON.parse(data.Body.toString()) // 将获取的对象内容解析为 JSON 格式
        resolve(jsonContent)
      }
    })
  })
}
