import { configInstance } from './remoteConfig'

class BizConfig {
  get demoConfig() {
    return configInstance.get('demoConfig')
  }
}

const bizConfig = new BizConfig()
export default bizConfig
