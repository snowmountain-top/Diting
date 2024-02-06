import { Controller, CustomerRequest } from '../../types'
import demoService from './service'

class DemoController implements Controller.DemoController.Main {
  async demoFunc(
    request: Controller.DemoController.Request.demoFunc,
    req: CustomerRequest,
  ): Promise<Controller.DemoController.Response.demoFunc> {
    console.info(req.userInfo)
    return demoService.demoFunc(request)
  }
}

const demoController = new DemoController()
export default demoController
