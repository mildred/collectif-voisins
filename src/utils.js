import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import * as Block from 'multiformats/block'
import canonicalize from 'canonicalize'
import * as hasher from 'multiformats/hashes/hasher'

const textEncoder = new TextEncoder()

export function debounce(delay, func) {
  let timer = null
  return (...args) => {
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => func(...args), delay)
  }
}

export async function disputatio_guid(json) {
  const hash = await sha256.digest(textEncoder.encode(canonicalize(json)))
  return CID.createV0(hash).toString()
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
