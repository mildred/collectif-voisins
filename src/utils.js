export function debounce(delay, func) {
  let timer = null
  return (...args) => {
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => func(...args), delay)
  }
}

export async function disputatio_query(request) {
  let res = await fetch('/.well-known/disputatio/', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sql: request
    })
  })
  return await res.json()
}

export function parse_julian(timestamp) {
  // https://en.wikipedia.org/wiki/Julian_day
  const J = Math.floor(timestamp)
  const wday = J % 7

  const y = 4716, v = 3,
        j = 1401, u = 5,
        m = 2,    s = 153,
        n = 12,   w = 2,
        r = 4,    B = 274277,
        p = 1461, C = -38

  const f = J + j + Math.floor((Math.floor((4 * J + B) / 146097) * 3) / 4 ) + C
  const e = r * f + v
  const g = Math.floor((e % p) / r)
  const h = u * g + w
  const day = Math.floor((h % s) / u) + 1
  const month = ((Math.floor(h / s) + m) % n) + 1
  const year = Math.floor(e / p) - y + Math.floor((n + m - month) / n)

  let frac = (timestamp - 0.5) - Math.floor(timestamp - 0.5)
  let hour = Math.floor(frac * 24.0)
  let min = Math.floor(24.0 * 60.0 * (frac - (hour / 24.0)))
  let sec = Math.floor(24 * 60 * 60 * (frac - (hour / 24.0) - (min / (24*60))))

  let unix = Date.UTC(year, month-1, day, hour, min, sec)

  let date = new Date(unix);

  return {
    wday, // 0..6 = sun..sat
    day,
    month,
    year,
    hour, min, sec,
    unix,
    date
  }
}

export function format_date(timestamp, options = {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'}) {
  const {day, month, year, hour, min, sec, unix} = parse_julian(timestamp)
  const d = new Date(unix);
  return d.toLocaleDateString(undefined, options) + ` ${hour}:${min}:${sec} `
}

export function format_time(timestamp) {
  //let frac = (timestamp - 0.5) - Math.floor(timestamp - 0.5)
  //let hours = Math.floor(frac * 24.0)
  //let minutes = Math.floor(24.0 * 60.0 * (frac - (hours / 24.0)))
  //return `${hours}:${String(minutes).padStart(2, '0')}`
  const {unix} = parse_julian(timestamp)
  const d = new Date(unix);
  return d.toLocaleTimeString()
}

