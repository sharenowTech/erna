const to = require('uffbasse')
const storage = require('./storage')
const env = require('./env')
const postman = require('./postman')
const slack = require('./slack')
const scheduler = require('./scheduler')

const signup = async (res, key, value) => {
  const result = await storage.push(key, value)

  return res.json((result ? postman.confirmation : postman.duplicate)(key))
}

const commands = async (req, res) => {
  const subcmd = req.body.text.split(' ')[0]

  switch (subcmd) {
    default:
      const alreadyExistsIn = await storage.in(req.body.user_id)
      const isNewbie = !(await storage.has(req.body.user_id))

      if (alreadyExistsIn) {
        return res.json(postman.duplicate(alreadyExistsIn))
      }

      if (env.locations.list.length === 1) {
        return signup(res, env.locations.list[0], req.body.user_id)
      }

      return res.json(postman.locationsPrompt(isNewbie))
  }
}

const actions = async (req, res) => {
  const payload = JSON.parse(req.body.payload)
  const action = payload.actions[0].name
  const userId = payload.user.id
  let location

  switch (action) {
    case 'create.location':
      location = payload.actions[0].selected_options[0].value
      return signup(res, location, userId)
    case 'create.location.cancel':
      return res.json(postman.createLocationCancel)
    case 'update.location.prompt':
      return res.json(postman.updateLocationsPrompt())
    case 'update.location':
      location = payload.actions[0].selected_options[0].value
      await storage.pop(userId)
      return signup(res, location, userId)
    case 'update.location.cancel':
      return res.json(postman.updateLocationCancel)
    case 'delete.location':
      await storage.pop(userId)
      return res.json(postman.deleteLocation)
  }
}

const match = async () => {
  const now = Date.now()
  const time = new Date(parseInt(now / 1000, 10) * 1000).toISOString()
  const cities = scheduler.find(time)

  if (!cities.length) {
    console.log('Matching skipped.')
    return
  }

  console.log('Matchting started.')
  const [err, matches] = await to(storage.match(cities), { defaults: [] })

  if (err) {
    console.log(`Matchting failed: ${err}`)
  }

  console.log('Matchting succeeded.')
  matches.forEach(function (match) {
    slack.triggerMatch(match)
  })

  console.log('Matchting cleaned up.')
  await to(storage.purge(cities))
}

module.exports = {
  commands,
  actions,
  match
}
