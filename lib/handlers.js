const bounce = require('bounce')
const storage = require('./storage')
const env = require('./env')
const postman = require('./postman')
const slack = require('./slack')

const signup = async (res, key, value) => {
  try {
    const result = await storage.push(key, value)

    return res.json(result ? postman.confirmation : postman.duplicate)
  } catch (err) {
    bounce.rethrow(err, 'system')
    console.error(err)
    return res.json(postman.error)
  }
}

const commands = async (req, res) => {
  const subcmd = req.body.text.split(' ')[0]

  switch (subcmd) {
    default:
      let exists = false

      try {
        exists = await storage.has(req.body.user_id)
      } catch (err) {
        bounce.rethrow(err, 'system')
        console.error(err)
      }

      if (exists) {
        return res.json(postman.duplicate)
      }

      if (env.locations.list.length === 1) {
        return signup(res, env.locations.list[0], req.body.user_id)
      }

      return res.json(postman.locations)
  }
}

const actions = (req, res) => {
  const payload = JSON.parse(req.body.payload)
  const action = payload.actions[0].name

  switch (action) {
    case 'location':
      const location = payload.actions[0].selected_options[0].value
      const userId = payload.user.id

      return signup(res, location, userId)
    case 'cancel':
      return res.json(postman.cancel)
  }
}

const match = (cities) => async () => {
  try {
    const matches = await storage.match(cities)

    matches.forEach(function (match) {
      slack.triggerMatch(match)
    })

    await storage.purge(cities)
  } catch (err) {
    bounce.rethrow(err, 'system')
    console.error(err)
  }
}

module.exports = {
  commands,
  actions,
  match
}
