const to = require('uffbasse')
const moment = require('moment')
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

const completeSchedule = async (res, location, key) => {
  const { date, time, user, title } = scheduler.popCache(key)
  const tz = env.locations.getTz(location)
  const local = moment.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', tz)
  const localDatetime = local.format('dddd, MMMM Do [at] h:mma')
  const utcDatetime = local.utc().toISOString()

  const existingEvent = await storage.setSchedule(user, location, utcDatetime, title)

  if (existingEvent) {
    return res.json(postman.duplicateSchedule(location, localDatetime, existingEvent, user))
  }

  return res.json(postman.validSchedule(location, localDatetime, title))
}

const commands = async (req, res) => {
  const args = req.body.text.split(' ')
  const subcmd = args.shift()
  const user = req.body.user_id

  switch (subcmd) {
    case 'schedule':
      const [date, time, ...rest] = args
      const title = rest.join(' ')
      const key = [user, date, time].join('_')

      if (!date || !time) {
        return res.json(postman.invalidScheduleFormat)
      }

      scheduler.cache(key, { date, time, user, title })
      return res.json(postman.scheduleLocationsPrompt(key, title))
    case 'skip':
      const [dateToSkip, timeToSkip] = args
      const datetimeToSkip = `${dateToSkip} ${timeToSkip}`

      if (!dateToSkip || !timeToSkip) {
        return res.json(postman.invalidSkipFormat)
      }

      if (await storage.setSkip(user, datetimeToSkip)) {
        return res.json(postman.duplicateSkip(datetimeToSkip))
      }

      scheduler.remove(datetimeToSkip)
      return res.json(postman.validSkip(datetimeToSkip))
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
  let key

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
    default:
      if (action.startsWith('schedule.location')) {
        location = payload.actions[0].selected_options[0].value
        key = action.substr(18)
        return completeSchedule(res, location, key)
      }
  }
}

const match = async () => {
  const now = Date.now()
  const datetime = new Date(parseInt(now / 1000, 10) * 1000).toISOString()
  const locations = await scheduler.find(datetime)

  if (!locations.length) {
    return
  }

  console.info(`Matchting started: ${locations.join(', ')}`)
  const [err, matches] = await to(storage.match(locations), { defaults: [] })

  if (err) {
    console.info(`Matchting failed: ${err}`)
  } else {
    console.info(`Matchting succeeded: ${JSON.stringify(matches)}.`)
  }

  matches.forEach(async function (match) {
    const [err] = await to(slack.triggerMatch(match))

    if (err) {
      console.info(`Notifying ${matches.join(',')} failed: ${err}`)
    }
  })

  console.info('Matchting cleaned up.')
  await to(storage.purge(locations))
}

const schedule = async (req, res) => {
  const custom = await storage.listSchedule()
  const skips = await storage.listSkips()
  const sortedCustom = Object.keys(custom).reduce((acc, location) => {
    if (custom[location].length) {
      acc[location] = custom[location].sort()
    }

    return acc
  }, {})

  return res.json({
    skips,
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
