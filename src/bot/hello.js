/* global process:false */
import { RTMClient } from '@slack/client'

export default robot => {
  const say = message => robot.send({ room: 'vipbot_dev' }, message)
  say('やっはろー！起動したよ')
  process.on('beforeExit', () => {
    say('無課金ユーザなので寝ます(3:00〜9:00, heroku運用)')
  })

  const rtm = new RTMClient(robot.adapter.options.token)
  rtm.on('member_joined_channel', async event => {
    const reply = await rtm.sendMessage(
      `@${event.user} ようこそ`,
      event.channel
    )
  })
}
