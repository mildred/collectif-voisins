export function parse_style(style) {
  let res = []
  for(let item_str of style.split(' ')) {
    let item = {
      merge_previous: false,
      name: 'div',
      classes: []
    }
    if (item_str.startsWith('=')) {
      item.merge_previous = true
      item_str = item_str.substr(1)
    } else if (item_str.startsWith('+')) {
      item_str = item_str.substr(1)
    }
    let parts = item_str.split(".")
    let name  = parts.shift()
    if (name != null) {
      switch(name) {
        case 'p':
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
        case 'ul':
        case 'ol':
        case 'li':
        case 'blockquote':
          item.name = name
          break
        case 'bq':
          item.name = 'blockquote'
          break
      }
      item.classes = parts
      res.push(item)
    }
  }
  if (res.length > 0) {
    res[res.length-1].merge_previous = false
  }
  return res
}

function esc_attr(str) {
  return new Option(p[1]).innerHTML.replace('"', '&quot;')
}

function html_close_open_style(parts, last_style, style, open_id) {
  let close_tags = []
  let i = last_style.length - 1
  while(i >= 0) {
    // console.log("i=%d drop %o", i, last_style[i])
    if (i >= style.length || last_style[i].name != style[i].name || !style[i].merge_previous) {
      parts.push(`</${last_style[i].name}>`)
      i--
    } else {
      break
    }
  }
  i++
  while (i < style.length) {
    // console.log("i=%d add %o", i, style[i])
    parts.push(`<${style[i].name}`)
    if (i == style.len - 1 && open_id) {
      parts.push(` id="${esc_attr(open_id)}"`)
    }
    if (style[i].classes.length > 0) {
      parts.push(` class="${esc_attr(style[i].classes.join(' '))}"`)
    }
    parts.push('>')
    i++
  }
}

// paragraphs is [[style, text, guid], [style, text, guid], ...]
export function to_html(paragraphs, after) {
  let parts = []
  let style = []
  let last_style = null
  for(let p of paragraphs) {
    last_style = style
    style = parse_style(p[0])
    let guid = p[2] || 'anonymous'
    html_close_open_style(parts, last_style, style, `paragraph-${guid}`)
    parts.push(new Option(p[1]).innerHTML)
    if (after) {
      parts.push(after(p))
    }
  }

  last_style = style
  style = []
  html_close_open_style(parts, last_style, style, null)

  return parts.join("")
}
