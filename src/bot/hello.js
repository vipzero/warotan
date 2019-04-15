export default robot => {
  robot.send({ room: 'vipbot_dev' }, 'やっはろー！起動したよ')
  // TODO: get disconnected event then say "おやすみ"
  // robot.adapter.on 'disconnected' ??
}
