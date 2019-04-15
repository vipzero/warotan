import cheerio from 'cheerio'
import { Iconv } from 'iconv'
import axios from 'axios'
const host = 'http://hebi.5ch.net'
const makeThreadUrl = id => `${host}/test/read.cgi/news4vip/${id}`
const listPageUrl = `${host}/news4vip/subback.html`

const sjis2utf8 = new Iconv('SHIFT_JIS', 'UTF-8//TRANSLIT//IGNORE')

axios.defaults.responseType = 'arraybuffer'
axios.defaults.transformResponse = [data => sjis2utf8.convert(data).toString()]

export async function getThreads() {
  const res = await axios.get(listPageUrl)
  const $ = cheerio.load(res.data)
  const threads = []
  $('#trad > a').map((i, elA) => {
    const a = $(elA)
    const { title, count } = titleParse(a.text())
    if (!title) {
      return
    }
    const href = a.attr('href')
    const id = href.split('/')[0]
    const url = makeThreadUrl(id)
    threads.push({ id, title, url, count })
  })
  return threads
}

function titleParse(text) {
  const m = text.match(/^\d+: ([\s\S]*?) \((\d+)\)$/)
  if (!m || !m[1]) {
    return null
  }

  return { title: m[1], count: Number(m[2]) }
}
