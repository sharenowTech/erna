class Storage {
  constructor () {
    this.locations = {}
  }

  has (user) {
    return Object.values(this.locations)
      .filter(x => !!x)
      .some(x => x.includes(user))
  }

  push (key, value) {
    if (!this.locations[key]) {
      this.locations[key] = []
    }

    if (!this.has(value)) {
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
    const locationIds = Object.keys(this.locations)
    const filteredLocationIds = locationIds.filter((id) => cities.includes(id))
    const matchesPerLocation = filteredLocationIds.map((id) => this.chunk(this.locations[id].sort(this.shuffle)))

    return [].concat(...matchesPerLocation)
  }

  purge (cities) {
    cities.forEach((city) => {
      delete this.locations[city]
    })
  }
}

module.exports = new Storage()
