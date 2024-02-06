import ScfClient from './ScfClient'

class BizTokenScf extends ScfClient {
  protected functionName: string = 'biz'

  getMiniAppVitalityToken(): Promise<string> {
    return this.callFunction({
      moduleName: 'core',
      serviceName: 'token',
      funcName: 'getMiniAppVitalityToken',
      param: null,
    })
  }
}

const bizTokenScf = new BizTokenScf()

export default bizTokenScf
