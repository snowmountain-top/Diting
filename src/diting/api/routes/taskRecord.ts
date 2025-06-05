import CustomerRouter from './CustomRouter'
import taskRecordController from '../controller/taskRecord'

const taskRecordRouter = new CustomerRouter(taskRecordController).router
export default taskRecordRouter
