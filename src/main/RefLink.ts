export interface RefLinkSource {
  value: string
  type: string
}

export default class RefLink {
  link: any
  source: RefLinkSource
  constructor(link) {
    this.link = link

    if (this.link[0]) {
      const mid = this.link[0]
      const source = {} as any
      switch (mid[0]) {
        case '$': {
          source.value = mid.slice(1)
          source.type = 'state'
          break
        }
        case '#': {
          source.value = mid.slice(1)
          source.type = 'tag'
          break
        }
        default: {
          source.value = mid
          source.type = 'source'
        }
      }
      this.source = source
    }
  }
  get type() {
    switch (this.link.length) {
      case 3: {
        return 'permlink'
      }
      case 2: {
        return 'root'
      }
      case 1: {
        return 'source'
      }
    }
  }
  get permlink() {
    return this.link[2]
  }
  get root() {
    return this.link[1]
  }
  toString() {
    return this.link.join(':')
  }
  static isValid(link) {
    try {
      RefLink.parse(link)
      return true
    } catch {
      return false
    }
  }
  static parse(link) {
    if (link instanceof RefLink) {
      return link
    }
    if (typeof link !== 'string') {
      throw new Error('Invalid reflink')
    }
    link = link.split(':')
    return new RefLink(link)
  }
}
