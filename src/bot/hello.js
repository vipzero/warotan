/* global process:false */
import { RTMClient } from '@slack/client'

export default robot => {
  const say = message => robot.send({ room: 'vipbot_dev' }, message)
  say('やっはろー！起動したよ')
  process.on('beforeExit', () => {
    say('無課金ユーザなので寝ます(3:00〜9:00, heroku運用)')
  })

  const rtm = new RTMClient(
    (robot.adapter.options && robot.adapter.options.token) ||
      process.env.HUBOT_SLACK_TOKEN
  )
  robot.logger.debug('RTM loaded')
  rtm.on('member_joined_channel', async event => {
    const res = await rtm.sendMessage(`@${event.user} ようこそ`, event.channel)
    console.log({ res })
  })
}
