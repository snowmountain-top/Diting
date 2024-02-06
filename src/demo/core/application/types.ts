import { Request as ExpressRequest } from 'express'
import { CustomerRequest } from '../types'

export namespace Application {
  export namespace Demo {
    export namespace Request {
      export interface demoFunction {}
    }
    export namespace Response {
      export interface demoFunction {}
    }
    export interface Main {
      demoFunction(
        request: Request.demoFunction,
        req: CustomerRequest,
      ): Promise<Demo.Response.demoFunction>
    }
  }
}
