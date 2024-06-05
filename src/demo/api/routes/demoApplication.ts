import processController from '../application/demo'
import CustomerRouter from './CustomerRouter'

const demoApplicationRouter = new CustomerRouter(processController).router
export default demoApplicationRouter
