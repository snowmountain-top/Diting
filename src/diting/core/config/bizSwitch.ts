import { switchInstance } from './remoteConfig'

/** 命名规范，isXxxxx，返回boolean */
class BizSwitch {
  get isDemoSwitchOn() {
    return switchInstance.isSwitchOn('demo')
  }

  get isSwitchToCloseCache(): boolean {
    return switchInstance.isSwitchOn('switchToCloseCache')
  }
}

const bizSwitch = new BizSwitch()
export default bizSwitch
