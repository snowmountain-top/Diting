import demoController from '../modules/demo/controller'
import { CustomerRequest } from '../types'
import { Application } from './types'

/** 仅给端上暴露，调用controller层接口，做聚合端上展示数据的逻辑 */
class DemoApplication implements Application.Demo.Main {
  async demoFunction(
    request: Application.Demo.Request.demoFunction,
    req: CustomerRequest,
  ): Promise<Application.Demo.Response.demoFunction> {
    demoController.demoFunc({}, req)
    return request
  }
}

const demoApplication = new DemoApplication()
export default demoApplication
