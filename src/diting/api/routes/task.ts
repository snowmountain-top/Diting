import taskController from '../controller/task'
import CustomerRouter from './CustomRouter'

const taskRouter = new CustomerRouter(taskController).router
export default taskRouter
