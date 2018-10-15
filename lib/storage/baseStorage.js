const environment = require('../environment')

module.exports = class BaseStorage {
  shuffle () {
    return 0.5 - Math.random()
  }

  chunk (list) {
    let tempList
    let index = 0
    const result = []
    const size = environment.matchSize
    const length = list.length

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
}
