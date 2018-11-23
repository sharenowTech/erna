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

    console.info(`Shuffling succeeded: ${JSON.stringify(result)}.`)
    return result
  }

  in () {
    throw new Error('A custom `in` function has to be implemented.')
  }

  push () {
    throw new Error('A custom `push` function has to be implemented.')
  }

  pop () {
    throw new Error('A custom `pop` function has to be implemented.')
  }

  match () {
    throw new Error('A custom `match` function has to be implemented.')
  }

  purge () {
    throw new Error('A custom `purge` function has to be implemented.')
  }

  setSchedule () {
    throw new Error('A custom `setSchedule` function has to be implemented.')
  }

  getSchedule () {
    throw new Error('A custom `getSchedule` function has to be implemented.')
  }

  nextSchedule () {
    throw new Error('A custom `nextSchedule` function has to be implemented.')
  }

  listSchedule () {
    throw new Error('A custom `listSchedule` function has to be implemented.')
  }
}
