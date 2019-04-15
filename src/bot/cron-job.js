import { CronJob } from 'cron'
import { getThreads } from '../module/scrape'

const triggers = {
  ero: {
    room: 'watch_ero',
    regex: /エロ(画像|漫画|い)|エッチ/,
  },
}

export default robot => {
  const threadWatch = async () => {
    const threads = await getThreads()
    const postedThreads = robot.brain.get('postedThreads') || {}
    const newPostedThreads = {}
    const postThreads = []
    threads.forEach(th => {
      if (th.title.match(/エロ(画像|漫画|い)|エッチ/)) {
        newPostedThreads[th.url] = true
        const alreadyPosted = postedThreads[th.url]
        if (!alreadyPosted) {
          postThreads.push(th)
        }
      }
    })
    if (postThreads.length > 0) {
      const text = postThreads.map(th => `${th.title}→${th.url}`).join('\n')
      robot.send({ room: 'watch_ero' }, text)
    }
    robot.brain.set('postedThreads', newPostedThreads)
  }
  const cron = new CronJob('00 * * * * *', threadWatch)
  cron.start()
}
