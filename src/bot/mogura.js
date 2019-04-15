import { CronJob } from 'cron'
import { getThreads } from '../module/scrape'
import _ from 'lodash'

const baseTriggers = {
  ero: {
    room: 'mog_ero',
    name: 'エロ画像',
    exceeded: 10,
    regex: /エロ(画像|漫画|い)|エッチ/,
    getImage: true,
  },
  minecraft: {
    room: 'mog_minecraft',
    name: 'マイクラ',
    exceeded: 1,
    regex: /マインクラフト|マイクラ|minecraft/i,
    getImage: false,
  },
  splatoon: {
    room: 'mog_splatoon',
    name: 'スプラトゥーン',
    exceeded: 1,
    regex: /スプラ|splatoon/i,
    getImage: false,
  },
  programming: {
    room: 'mog_programmer',
    name: 'プログラミング',
    exceeded: 1,
    regex: /プログラ/,
    getImage: false,
  },
}

export default robot => {
  robot.hear(/^もぐら( help)?$/i, res => {
    res.send(`もぐらはスレッド監視するよ！
Usage:
  もぐら help: このヘルプを表示するよ
  もぐら list: 監視リスト
  もぐら add hoge: カスタム監視追加
  もぐら remove hoge: カスタム監視削除
`)
  })
  const getTriggers = () => {
    const mogura = robot.brain.get('mogura') || {}
    const keywrods = _.keys(mogura)
    if (keywrods.length === 0) {
      return baseTriggers
    }
    const custom = {
      room: 'mog',
      name: 'もぐら中',
      exceeded: 1,
      regex: new RegExp(keywrods.join('|')),
      getImage: false,
    }
    return _.merge({}, baseTriggers, { custom })
  }
  robot.hear(/^もぐら list$/i, res => {
    const triggerTexts = _.map(
      getTriggers(),
      (trigger, triggerId) =>
        `${triggerId.padEnd(12)} => #${trigger.room.padEnd(17)} ${
          trigger.regex
        }`
    )
    res.send([`もぐら機能(スレッド監視)`, ...triggerTexts].join('\n'))
  })

  robot.hear(/もぐら add (.+)/i, res => {
    const keyword = res.match[1]
    const mogura = robot.brain.get('mogura') || {}
    mogura[keyword] = true
    robot.brain.set('mogura', mogura)
    res.send(`${keyword} を覚えたよ。#mog に流すよ。`)
  })

  robot.hear(/もぐら remove (.+)/i, res => {
    const keyword = res.match[1]
    const mogura = robot.brain.get('mogura') || {}
    robot.brain.set('mogura', _.omit(mogura, [keyword]))
    res.send(`${keyword} を忘れた。`)
  })

  const threadWatch = async () => {
    const threads = await getThreads()
    const readedThreads = robot.brain.get('readedThreads') || {}

    const newPostedThreads = {}
    _.forEach(getTriggers(), (trigger, triggerId) => {
      // th.count でフィルタ
      const drafts = []
      threads.forEach(th => {
        if (th.count < trigger.exceeded) {
          return
        }
        // 既ポストスレッドを trigger 毎に保存する
        const id = `${triggerId}-${th.id}`
        if (th.title.match(trigger.regex)) {
          newPostedThreads[id] = true
          const alreadyPosted = readedThreads[id]
          if (!alreadyPosted) {
            drafts.push(th)
          }
        }
      })
      if (drafts.length > 0) {
        const textHeader = `${trigger.name} のスレを見つけたぞ！\n`
        const text = [
          textHeader,
          ...drafts.map(th => `${th.title}→${th.url}`),
        ].join('\n')
        robot.send({ room: trigger.room }, text)
      }
    })
    robot.brain.set('readedThreads', newPostedThreads)
  }
  const cron = new CronJob('00 * * * * *', threadWatch)
  cron.start()
}
