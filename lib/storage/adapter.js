const env = require('../env')

module.exports = class Adapter {
  init () {}

  flatten (list) {
    return [].concat(...list)
  }

  shuffle () {
    return 0.5 - Math.random()
  }

  chunk (list) {
    const size = env.matchSize
    const length = list.length
    const result = []
    let tempList
    let index = 0

    if (length < 2) {
      return [list]
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

  has () {
    throw new Error('A custom `has` function has to be implemented.')
  }

  push () {
    throw new Error('A custom `push` function has to be implemented.')
  }

  match () {
    throw new Error('A custom `match` function has to be implemented.')
  }

  purge () {
    throw new Error('A custom `purge` function has to be implemented.')
  }
}
