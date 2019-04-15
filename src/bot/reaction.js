export default robot => {
  robot.hear(/ぬるぽ/i, res => {
    res.send('ｶﾞｯ')
  })
}
