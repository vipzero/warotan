/* global process:false */

export default robot => {
  const say = message => robot.send({ room: 'vipbot_dev' }, message)
  say('やっはろー！起動したよ')
  process.on('beforeExit', () => {
    say('無課金ユーザなので寝ます(3:00〜9:00, heroku運用)')
  })
}
