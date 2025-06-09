import { CronJob } from 'cron'
import * as fns from 'date-fns'
import taskService from '../task/service'
import TaskEntity from '../../entity/Task'
import { TaskRecordStatus, TaskRunMode } from '../../../enum'
import executionService from '../execution/service'
import getLogger from '../../../utils/logger'
import TaskRecordEntity from '../../entity/TaskRecord'
import taskRecordService from '../taskRecord/service'
import BizError from '../../../errors/BizError'

const logger = getLogger()

class ScheduleService {
  private jobs: Record<string, CronJob> = {}

  async startAllJobs() {
    const tasks = await taskService.queryAllActiveCronTask()
    for (const task of tasks) {
      await this.startJob(task)
    }
    logger.info(`已成功加载 ${tasks.length} 个定时任务`)
  }

  /**
   * 启动任务
   */
  async startJob(task: TaskEntity) {
    const job = new CronJob(
      // 手动执行方式: 延后5s. 或按照cron表达式执行
      task.runMode === TaskRunMode.MANUAL ? fns.addSeconds(new Date(), 5) : task.cronExpression,
      async () => {
        const taskRecord = await taskRecordService.initialFromTask(task)
        await this.executeJob(taskRecord)
        // 手动运行的任务需要清理数据
        if (task.runMode === TaskRunMode.MANUAL) {
          this.cleanJob(task.id)
        }
      },
      async () => {
        console.info('任务执行完成')
      },
    )
    job.start()
    this.addJob(task.id, job)
    logger.info(`已成功启动任务: ${task.name} | ${task.id}`)
  }

  get runningJobs() {
    return Object.keys(this.jobs)
  }

  private addJob(taskId: string, job: CronJob) {
    this.jobs[taskId] = job
  }

  private cleanJob(taskId: string) {
    if (taskId in this.jobs) {
      this.jobs[taskId].stop()
      delete this.jobs[taskId]
    }
  }

  private getTaskExecutionDurationSec(taskRecord: TaskRecordEntity) {
    const duration = fns.differenceInSeconds(new Date(), taskRecord.executionTime)
    return duration
  }

  /**
   * 任务执行逻辑
   */
  private async executeJob(taskRecord: TaskRecordEntity) {
    try {
      await executionService.run(taskRecord)
      logger.info(`任务[${taskRecord.taskId}]执行成功: 记录[${taskRecord.id}] `)
      await taskRecordService.update(taskRecord.id, {
        status: TaskRecordStatus.SUCCESS,
        durationSec: this.getTaskExecutionDurationSec(taskRecord),
      })
    } catch (error) {
      logger.error('任务执行失败', error)
      const errorLog = error instanceof BizError ? error.message : error.stack
      await taskRecordService.update(taskRecord.id, {
        status: TaskRecordStatus.FAILED,
        errorLog,
        durationSec: this.getTaskExecutionDurationSec(taskRecord),
      })
    }
  }
}

const scheduleService = new ScheduleService()

export default scheduleService
