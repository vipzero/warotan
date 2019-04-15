export default robot => {
  const say = robot.send.bind(null, { room: 'vipbot_dev' })
  say('やっはろー！起動したよ')
  process.on('SIGTERM', () => {
    say('無課金ユーザなので寝ます(3:00〜9:00, heroku運用)')
  })
  // TODO: get disconnected event then say "おやすみ"
  // robot.adapter.on 'disconnected' ??
}
