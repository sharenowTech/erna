const env = require('./env')
const scheduler = require('./scheduler')
const {
  locationsPrompt,
  createLocationCancelButton,
  updateLocationCancelButton,
  updateLocationsPromptButton,
  deleteLocationButton,
  notifyButton
} = require('./components')

const random = (list) => list[Math.floor(Math.random() * list.length)]

class Postman {
  _linkMatches (matches) {
    const links = matches.map((x) => `<@${x}>`)

    if (links.length === 1) {
      return links
    }

    const last = links.pop()

    return [links.join(', '), last].join(' & ')
  }

  _locations (text, name) {
    const enableCancel = name === 'create.location'

    return {
      attachments: [
        {
          callback_id: name,
          color: '#00a0e1',
          attachment_type: 'default',
          actions: [locationsPrompt(name), ...(enableCancel ? [createLocationCancelButton] : [])],
          text
        }
      ]
    }
  }

  get triggeredNotify () {
    return { text: 'Triggered notifications!' }
  }

  async notify (location) {
    const { date } = await scheduler.getNext(location)
    return notifyButton(date)
  }

  get invalidScheduleFormat () {
    const text = random([
      `Schedule failed. Please use the format '<YYYY-MM-DD> <HH:mm> [<title>]'.`
    ])

    return { text }
  }

  get invalidSkipFormat () {
    const text = random([
      `Skipping failed. Please use the format '<YYYY-MM-DD> <HH:mm>'.`
    ])

    return { text }
  }

  get error () {
    return random([
      'An error occurred. Please try again later or contact the person in charge.',
      'Oh no, something went wrong! Please try again later or contact the person in charge.',
      'Damn it! I have actually no idea what\'s the issue.\nPlease try again or ask the guy who brought me to life'
    ])
  }

  get deleteLocation () {
    return random([
      { text: 'I cancelled your date, but maybe next time! 🙃' },
      { text: 'Too bad! I\'ll let your match know something important came up! ☝️' },
      { text: 'I\'m looking for a backup for your date. See you next time 😊.' }
    ])
  }

  get updateLocationCancel () {
    return random([
      { text: 'The date stays the way it was 👋.' },
      { text: 'Alright, your date remains unchanged. Stay tuned! ☝️' },
      { text: 'In that case, look forward to your date! Even I\'m already excited 🙃.' }
    ])
  }

  get createLocationCancel () {
    return random([
      { text: 'That\'s a pity, but maybe next time! 🙃' },
      { text: 'Too bad, but maybe next time! 🙃' },
      { text: 'C\'mon, your colleagues don\'t bite 😬.' },
      { text: 'Sorry! Are you unsatisfied with me? Let me know! ☝️' },
      { text: 'C\'mon, try it, you can change your mind anytime 😬.' }
    ])
  }

  get noMatch () {
    return random([
      'Unfortunately there\'s no match today.\nJust wait at the door and follow the people you want to lunch with 👽',
      'Sorry, I didn\'t find anyone today. Try again next time! 😊',
      'Sorry, there\'s no match today. But don\'t give up! 🤗',
      'Seems like no one\'s in the mood for company while having lunch today! 🙁',
      'No lunch date today – tell your colleagues about me, maybe it will work out next time ☝️\nI\'m so sorry!.'
    ])
  }

  match (matches) {
    const links = this._linkMatches(matches)

    return random([
      `Your lunch date: ${links}.\nGet in touch and enjoy your lunch! 😋`,
      `As promised, I have a lunch date for you! 🎉\nGet in touch with ${links}.`,
      `Surely you have waited already for your date! 😉\n Drop ${links} a line and enjoy your lunch.`,
      `And it's time again: I have a lunch date for you!🎉\n Just clarify the details with ${links} and enjoy your meal.`
    ])
  }

  matchGroup (matches) {
    const links = this._linkMatches(matches)

    return random([
      `Hi ${links} – you have been matched for a lunch date!\nGet in touch with each other and enjoy your lunch! 😋`,
      `Hiya ${links}!\nAs promised, I have organized a lunch date! 🎉\nSettle the details and enjoy your lunch!`,
      `Surely you have waited already for your date! 😉\nWell you – ${links} – have matched.\nI hope you're looking forward to meeting each other and enjoying your lunch.`,
      `Booya!! It's time again: I have set up a lunch date ${links}!🎉\nJust clarify the details and enjoy your meal.`
    ])
  }

  async confirmation (location) {
    const { date, isCustom, title } = await scheduler.getNext(location)

    const baseText = random([
      `Awesome 🎉\nI will notify you at ${date} about your match right here in Slack.`,
      `And you're in! Your match will be fantastic 😍.\nI'll let you know at ${date} right here in Slack.`,
      `Whoo-hoo! I'm glad you joined!🎉\nI already have your perfect lunch date but I can't tell you until ${date}.`,
      `So glad you joined. I will let you know about your match at ${date}.`
    ])

    return { text: isCustom ? `${baseText}\n\nFYI: it's ${title || 'a scheduled onetime event'} in ${location} 🎉.` : baseText }
  }

  locationsPrompt (isNewbie, command = '/erna') {
    const matchDay = env.matchDay.long
    const matchTime = env.matchTime.pretty
    const frequency = env.matchInterval.frequency(matchDay)

    const text = random([
      `Hi, I'm *Erna*. I organise lunch dates ${frequency} at ${matchTime}.\nAnd I will find one for you. Where are you located? 😊`,
      `Hiya, it's me, *Erna*.\nI'm responsible for setting up lunch dates ${frequency} at ${matchTime}.\nWanna get to know new people? If so, where are you located?😊`,
      `I'm glad to hear from you.\nI am *Erna* and organize lunch dates ${frequency} at ${matchTime}.\nWhat list can I put you on?😉`
    ])

    const newbieText = random([
      `Hi newbie, nice to meet you!👋🏼\n\nMy name is *Erna* and I assist with your personal lunch date🙋🏼‍♀️.\nJust choose the location you wanna join and ${frequency} at ${matchTime} I'll set up a private conversation with your match right here in Slack.\n\nSome more hints:\n1) no worries, nobody sees our current conversation 🤫\n2) enter \`${command}\` again to update or delete your registration\n3) The signup is just valid for the next event`
    ])

    return this._locations(isNewbie ? newbieText : text, 'create.location')
  }

  updateLocationsPrompt () {
    const text = random([
      `Let us update your next lunch date.\nWhere are you located? 😊`,
      `What list can I put you on instead?😊`,
      `Have you changed your mind? 😉\nWhere do you want to meet someone for lunch?`
    ])

    return this._locations(text, 'update.location')
  }

  scheduleLocationsPrompt (key, title) {
    const text = random([
      `Oh you'd like to schedule an event 🎉.\nNow, just pick the right location for ${title || 'the event'}`,
      `We are almost done with scheduling, just one last step:\nWhat's the location of ${title || 'the event'}?😊`,
      `Awesome, another event!😋\nFor which location should I schedule ${title || 'the event'}?`
    ])

    return this._locations(text, `schedule.location.${key}`)
  }

  duplicate (location) {
    const singleLocation = (env.locations.list.length === 1)

    const baseText = random([
      `You are already registered for the next lunch in ${location}😉.`,
      `You already signed up for ${location} 😉.`,
      `Seems like you already asked me to put you on the list 😊.`
    ])

    const actions = [...(singleLocation ? [] : [updateLocationsPromptButton]), deleteLocationButton, updateLocationCancelButton]
    const text = `${baseText}\nWant to ${!singleLocation && 'update or '}cancel your date?`

    return {
      attachments: [
        {
          callback_id: 'updateOrDeleteEvent',
          color: '#00a0e1',
          attachment_type: 'default',
          actions,
          text
        }
      ]
    }
  }

  duplicateSchedule (location, datetime, data, user) {
    const contactDetails = !data.user ? '' : data.user === user ? '\nBTW: that was you 😉.' : `\nFeel free to contact <@${data.user}>, the organizer.`
    const text = `Sorry, something went wrong!\nThere's already ${data.title || 'an event'} scheduled in ${location} at ${datetime}.${contactDetails}`

    return { text }
  }

  validSchedule (location, datetime, title) {
    const text = `Successfully scheduled ${title || 'an event'} in ${location === 'everywhere' ? 'all locations' : location} at ${datetime}.`

    return { text }
  }

  duplicateSkip (date) {
    const text = `Sorry, something went wrong!\nAll events at ${date} will be already skipped.`

    return { text }
  }

  validSkip (datetime) {
    const text = `Successfully skipped the regular event at ${datetime} at all locations.`

    return { text }
  }
}

module.exports = new Postman()
