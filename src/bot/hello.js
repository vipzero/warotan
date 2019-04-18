/* global process:false */
import { RTMClient } from '@slack/client'
import _ from 'lodash'

const dev_warotan = 'dev_warotan'
const channels = {
  dev_warotan,
}

export default robot => {
  const say = message => robot.send({ room: channels.dev_warotan }, message)
  say('やっはろー！起動したよ')
  process.on('beforeExit', () => {
    say('無課金ユーザなので寝ます(3:00〜9:00, heroku運用)')
  })

  robot.hear(/^(hello|はろー|ハロー)( help)?$/i, res => {
    res.send(`新参にwelcomeメッセージを送るよ！
Usage:
  はろー help: このヘルプを表示するよ
  はろー list: めっせーじリスト
  はろー add hoge: メッセージ追加
  はろー remove hoge: メッセージ削除
`)
  })

  robot.hear(/^(hello|はろー|ハロー) add (.+)$/i, res => {
    const keyword = res.match[2]
    robot.brain.set(
      'helloMessages',
      _.merge({}, robot.brain.get('helloMessages'), { [keyword]: true })
    )
    res.send(`${keyword} 了解！新参に伝えとく`)
  })

  robot.hear(/^(hello|はろー|ハロー) remove (.+)$/i, res => {
    const keyword = res.match[2]
    robot.brain.set(
      'helloMessages',
      _.omit(robot.brain.get('helloMessages'), [keyword])
    )
    res.send(`${keyword} を忘れた。`)
  })

  robot.hear(/^(hello|はろー|ハロー) list$/i, res => {
    const messages = robot.brain.get('helloMessages') || {}
    res.send([`はろー機能`, ..._.keys(messages)].join('\n'))
  })

  const rtm = new RTMClient(
    (robot.adapter.options && robot.adapter.options.token) ||
      process.env.HUBOT_SLACK_TOKEN
  )
  robot.logger.debug('RTM loaded')
  rtm.on('member_joined_channel', async event => {
    const messages = robot.brain.get('helloMessages') || {}
    const message = _.sample(_.keys(messages)) || 'おはだお'
    await rtm.sendMessage(`<@${event.user}> ${message}`, event.channel)
  })

  rtm.on('channel_joined', async event => {
    await rtm.sendMessage(
      `ななななんか用ですか...？優しくしてね...`,
      event.channel
    )
  })
  rtm.start()
}
