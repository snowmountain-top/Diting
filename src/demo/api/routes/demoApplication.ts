import { Router } from 'express'
import { transfer } from '../middleware/router'
import processController from '../../core/application/demo'

const demoApplicationRouter = Router()

const funcNameList = Reflect.ownKeys(processController.constructor.prototype).filter(
  (item) => item !== 'constructor',
)

for (const funcName of funcNameList) {
  demoApplicationRouter.post(...transfer(processController[funcName]))
}

export default demoApplicationRouter
