const env = require('../env')

module.exports = class Adapter {
  init () {}

  flatten (list) {
    return [].concat(...list)
  }

  shuffle (list) {
    console.info(`Shuffling started: ${JSON.stringify(list)}`)

    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]]
    }

    console.info(`Shuffling succeeded: ${JSON.stringify(list)}.`)
    return list
  }

  chunk (list) {
    const size = env.matchSize
    const length = list.length
    const result = []
    let index = 0
    let tempList
    let tempItem

    if (length < 2) {
      return [list]
    }

    while (index < length) {
      tempList = list.slice(index, index + size)

      if (tempList.length === 1) {
        if (size === 2) {
          result[result.length - 1].push(tempList[0])
        } else {
          tempItem = result[result.length - 1].pop()
          result.push([...tempList, tempItem])
        }
      } else {
        result.push(tempList)
      }

      index += size
    }

    console.info(`Chunking succeeded: ${JSON.stringify(result)}.`)
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

  setSkip () {
    throw new Error('A custom `setSkip` function has to be implemented.')
  }

  listSkips () {
    throw new Error('A custom `listSkips` function has to be implemented.')
  }
}
