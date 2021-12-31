import { CID } from 'multiformats'

/**
 * @param {Uint8Array|CID|string} path
 */
export function normalizeCidPath(path: string | Uint8Array | string) {
  if (path instanceof Uint8Array) {
    return CID.decode(path).toString()
  }

  path = path.toString()

  if (path.indexOf('/ipfs/') === 0) {
    path = path.substring('/ipfs/'.length)
  }

  if (path.charAt(path.length - 1) === '/') {
    path = path.substring(0, path.length - 1)
  }

  return path
}
