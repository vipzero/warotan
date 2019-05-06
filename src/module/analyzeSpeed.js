function calcSpeed(newCount, oldCount, newTime, oldTime) {
  return ((newCount - oldCount) * 60000) / (newTime - oldTime)
}

export function analyzeSpeed(threads, timestamp, oldCapture) {
  const newCaptures = {
    timestamp,
    captures: {},
  }
  threads.map(doc => {
    const cap = oldCapture.captures[doc.title]
    if (!cap) {
      newCaptures.captures[doc.title] = {
        count: doc.count,
        speed: 0,
      }
      return
    }
    newCaptures.captures[doc.word] = {
      count: doc.count,
      speed: calcSpeed(doc.count, cap.count, timestamp, oldCapture.timestamp),
    }
  })
  return newCaptures
}
