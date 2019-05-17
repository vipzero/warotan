import { CronJob } from 'cron'
import { getThreads } from '../module/scrape'
import _ from 'lodash'
import { analyzeSpeed } from '../module/analyzeSpeed'

const baseTriggers = {
  ero: {
    room: 'mog_ero',
    name: 'エロ画像',
    exceeded: 10,
    regex: /エ(ロ|ッチ).*画像/,
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
  return // NOTE: disabled
  robot.hear(/^(mogura|もぐら)( help)?$/i, res => {
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
  robot.hear(/^(mogura|もぐら) list$/i, res => {
    const triggerTexts = _.map(
      getTriggers(),
      trigger =>
        `#${trigger.room} ${trigger.regex}` +
        (trigger.exceeded === 1 ? '' : `[${trigger.exceeded}レス以上]`)
    )
    res.send([`もぐら機能(スレッド監視)`, ...triggerTexts].join('\n'))
  })

  robot.hear(/^(mogura|もぐら) add (.+)$/i, res => {
    const keyword = res.match[2]
    robot.brain.set(
      'mogura',
      _.merge(robot.brain.get('mogura'), { [keyword]: true })
    )
    res.send(`${keyword} を覚えたよ。#mog に流すよ。`)
  })

  robot.hear(/^(mogura|もぐら) remove (.+)$/i, res => {
    const keyword = res.match[2]
    robot.brain.set('mogura', _.omit(robot.brain.get('mogura'), [keyword]))
    res.send(`${keyword} を忘れた。`)
  })

  const threadWatch = async () => {
    const threads = await getThreads()
    mogura(robot, threads)
    trend(robot, threads)
  }
  const cron = new CronJob('00 * * * * *', threadWatch)
  cron.start()
}

function mogura(robot, threads) {
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
      const textHeader = `【${trigger.name} スレ発見！】\n`
      const text = [
        textHeader,
        ...drafts.map(th => `${th.title}\n${th.url}`),
      ].join('\n')
      robot.send({ room: trigger.room }, text)
    }
  })
  robot.brain.set('readedThreads', newPostedThreads)
}

function trend(robot, threads) {
  const oldSpeedThreads = robot.brain.get('speedThreads') || {
    timestamp: 0,
    captures: {},
  }
  const speedThreads = analyzeSpeed(threads, Date.now(), oldSpeedThreads)
  robot.brain.set('speedThreads', speedThreads)
  robot.send({ room: 'trend' }, JSON.stringify(speedThreads))
}
