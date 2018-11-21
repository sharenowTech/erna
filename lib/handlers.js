const to = require('uffbasse')
const storage = require('./storage')
const env = require('./env')
const postman = require('./postman')
const slack = require('./slack')
const scheduler = require('./scheduler')

const signup = async (res, key, value) => {
  const result = await storage.push(key, value)
  const data = result ? (await postman.confirmation(key)) : postman.duplicate(key)

  return res.json(data)
}

const commands = async (req, res) => {
  const args = req.body.text.split(' ')
  const subcmd = args.shift()

  switch (subcmd) {
    case 'schedule':
      const user = req.body.user_id
      const [location, date, time] = args
      const invalidFormat = `Schedule failed. Please use the format '<location> <yyyy-mm-dd> <hh:mm (UTC)>'.`
      const invalidLocation = `Schedule failed. Please choose a valid location: ${env.locations.list.join(', ')}.`

      if (!date || !time) {
        return res.json({ text: invalidFormat })
      }

      const lowercaseLocation = location.toLowerCase()
      const validLocation = env.locations.list.find(x => x.toLowerCase() === lowercaseLocation)
      const [year, month, day] = date.split('-')
      const [hours, minutes] = time.split(':')
      const datetime = new Date(Date.UTC(year, month - 1, day, hours, minutes)).toISOString()

      if (!validLocation) {
        return res.json({ text: invalidLocation })
      }

      await storage.setSchedule(user, validLocation, datetime)
      return res.json({ text: `Successfully scheduled an event in ${validLocation} at ${datetime} (UTC).` })
    default:
      const alreadyExistsIn = await storage.in(req.body.user_id)
      const isNewbie = !(await storage.has(req.body.user_id))

      if (alreadyExistsIn) {
        return res.json(postman.duplicate(alreadyExistsIn))
      }

      if (env.locations.list.length === 1) {
        return signup(res, env.locations.list[0], req.body.user_id)
      }

      return res.json(postman.locationsPrompt(isNewbie, req.body.command))
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
  const datetime = new Date(parseInt(now / 1000, 10) * 1000).toISOString()
  const locations = await scheduler.find(datetime)

  if (!locations.length) {
    console.info(`Matching skipped: ${datetime}.`)
    return
  }

  console.info(`Matchting started: ${locations.join(', ')}`)
  const [err, matches] = await to(storage.match(locations), { defaults: [] })

  if (err) {
    console.info(`Matchting failed: ${err}`)
  }

  console.info(`Matchting succeeded: ${matches.length} matches.`)
  matches.forEach(function (match) {
    slack.triggerMatch(match)
  })

  console.info('Matchting cleaned up.')
  await to(storage.purge(locations))
}

const schedule = async (req, res) => {
  const custom = await storage.listSchedule()
  const sortedCustom = Object.keys(custom).reduce((acc, location) => {
    if (custom[location].length) {
      acc[location] = custom[location].sort()
    }

    return acc
  }, {})

  return res.json({
    custom: sortedCustom,
    regular: scheduler.events
  })
}

module.exports = {
  commands,
  actions,
  match,
  schedule
}
