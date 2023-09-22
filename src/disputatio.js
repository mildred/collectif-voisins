import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import * as Block from 'multiformats/block'
import canonicalize from 'canonicalize'
import * as hasher from 'multiformats/hashes/hasher'

const textEncoder = new TextEncoder()

export async function guid(json) {
  if(json === undefined) throw new Error(`Cannot compute GUID for ${json}`)
  const payload = canonicalize(json)
  const hash = await sha256.digest(textEncoder.encode(payload))
  const guid = CID.createV0(hash).toString()
  console.log("Compute GUID %s for %o", guid, payload)
  return guid
}

export function city_public_group(code, name) {
  return {
    t: 'group-item',
    n: name,
    gt: 3,
    ud: `collectif-voisins:insee:${code}`,
    ow: 1,
    s: 1,
    m: []
  }
}
