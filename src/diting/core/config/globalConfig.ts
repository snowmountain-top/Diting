import { globalConfigInstance } from './fetchTokenConfig'

class GlobalConfig {
  getTokenKey() {
    return globalConfigInstance.get('tokenKey', '')
  }

  getTokenKeyForWard() {
    return globalConfigInstance.get('tokenKeyForward', '')
  }

  getTokenKeyBackUp() {
    return globalConfigInstance.get('tokenKeyBackUp', '')
  }

  // 0 1 -1
  getServerTokenSwitch() {
    return globalConfigInstance.get('serverTokenKeySwitch', '')
  }

  // 15秒
  getOutOfTimeTimeStamp() {
    return globalConfigInstance.get('outOfTimeTimeStamp', '')
  }
}

const globalConfig = new GlobalConfig()

export default globalConfig
