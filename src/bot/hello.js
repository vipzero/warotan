import { CronJob } from 'cron'
import { getThreads } from '../module/scrape'

export default robot => {
  robot.send({ room: 'vipbot_dev' }, 'やっはろー！起動したよ')
}
