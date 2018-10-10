class Storage {
  constructor () {
    this.locations = {}
  }

  push (key, value) {
    if (!this.locations[key]) {
      this.locations[key] = []
    }

    if (!this.locations[key].includes(value)) {
      this.locations[key].push(value)
      return true
    }

    return false
  }

  shuffle () {
    return 0.5 - Math.random()
  }

  chunk (list) {
    let tempList
    let index = 0
    const result = []
    const size = 2
    const length = list.length

    if (!length) {
      return []
    }

    while (index < length) {
      tempList = list.slice(index, index + size)

      if (tempList.length === 1) {
        result[result.length - 1].push(tempList[0])
      } else {
        result.push(tempList)
      }

      index += size
    }

    return result
  }

  match (cities) {
    const matchesPerLocation = Object.keys(this.locations)
      .filter((id) => cities.incldes(id))
      .map((id) => this.chunk(this.locations[id].sort(this.shuffle)))

    return [].concat(...matchesPerLocation)
  }

  purge () {
    this.locations = {}
  }
}

module.exports = new Storage()
