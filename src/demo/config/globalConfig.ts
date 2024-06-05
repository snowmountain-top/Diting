import { globalConfigInstance } from '../utils/remoteConfig'

class GlobalConfig {
  get tokenKey() {
    return globalConfigInstance.get('tokenKey', '')
  }

  get tokenKeyForWard() {
    return globalConfigInstance.get('tokenKeyForward', '')
  }

  get tokenKeyBackUp() {
    return globalConfigInstance.get('tokenKeyBackUp', '')
  }

  // 0 1 -1
  get serverTokenSwitch() {
    return globalConfigInstance.get('serverTokenKeySwitch', '')
  }

  // 15秒
  get outOfTimeTimeStamp() {
    return globalConfigInstance.get('outOfTimeTimeStamp', '')
  }
}

const globalConfig = new GlobalConfig()
export default globalConfig
