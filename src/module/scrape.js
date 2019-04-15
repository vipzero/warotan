import cheerio from 'cheerio'
import { Iconv } from 'iconv'
import axios from 'axios'
const baseUrl = 'http://hebi.5ch.net/news4vip'
const pageUrl = `${baseUrl}/subback.html`

const sjis2utf8 = new Iconv('SHIFT_JIS', 'UTF-8//TRANSLIT//IGNORE')

axios.defaults.responseType = 'arraybuffer'
axios.defaults.transformResponse = [data => sjis2utf8.convert(data).toString()]

export async function getThreads() {
  const res = await axios.get(pageUrl)
  const $ = cheerio.load(res.data)
  const threads = []
  $('#trad > a').map((i, elA) => {
    const a = $(elA)
    const { title, count } = titleParse(a.text())
    if (!title) {
      return
    }
    const url = `${baseUrl}/${a.attr('href')}`
    threads.push({ title, url })
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
