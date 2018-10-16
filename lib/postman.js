const env = require('./env')
const scheduler = require('./scheduler')

const random = (list) => list[Math.floor(Math.random() * list.length)]

const locationSelect = {
  name: 'location',
  type: 'select',
  text: 'Location',
  options: env.locations.list.map((location) => ({
    text: location,
    value: location
  }))
}

const cancelButton = {
  name: 'cancel',
  type: 'button',
  text: 'Cancel',
  style: 'danger',
  value: true
}

const cancelDateButton = {
  name: 'cancelDate',
  type: 'button',
  text: 'Cancel Date',
  style: 'danger',
  value: true
}

const updateButton = {
  name: 'update',
  type: 'button',
  text: 'Update',
  value: true
}

class Postman {
  constructor () {
    this.error = 'An error occurred. Please try again later or contact the person in charge.'
    this.cancelled = { text: 'I cancelled your date, but maybe next time! 🙃' }
  }

  linkMatches (matches) {
    const links = matches.map(x => `<@${x}>`)

    if (links.length === 1) {
      return links
    }

    const last = links.pop()

    return [links.join(', '), last].join(' & ')
  }

  get cancel () {
    return random([
      { text: 'That\'s a pity, but maybe next time! 🙃' },
      { text: 'Too bad, but maybe tomorrow! 🙃' },
      { text: 'C\'mon, your colleagues don\'t bite 😬.' }
    ])
  }

  get nope () {
    return random([
      'Sorry, I didn\'t find anyone today. Try again tomorrow! 😊',
      'Sorry, there\'s no match today. But don\'t give up! 🤗'
    ])
  }

  hooray (matches) {
    const links = this.linkMatches(matches)

    return random([
      `Your lunch date: ${links}.\nGet in touch and enjoy your lunch! 😋`,
      `As promised, I have a lunch date for you! 🎉\nGet in touch with ${links}.`,
      `Surely you have waited already for your date! 😉\n Drop ${links} a line and enjoy your lunch.`
    ])
  }

  hoorayAll (matches) {
    const links = this.linkMatches(matches)

    return random([
      `Hi ${links} – you have been matched for a lunch date!\nGet in touch with each other and enjoy your lunch! 😋`,
      `Hiya ${links}!\nAs promised, I have organized a lunch date! 🎉\nSettle the details and enjoy your lunch!`,
      `Surely you have waited already for your date! 😉\nWell you – ${links} – have matched.\nI hope you're looking forward to meeting each other and enjoying your lunch.`
    ])
  }

  confirmation (city) {
    const matchDate = scheduler.getNext(city)

    return random([
      { text: `Awesome 🎉\nI will notify you ${matchDate} about your match right here in Slack.` },
      { text: `You wouldn't believe whom I've found as your match!😱\nI'll tell you ${matchDate} right here in Slack.` }
    ])
  }

  locationsPrompt (text, enableCancel) {
    return {
      attachments: [
        {
          fallback: 'You are unable to choose a location 😔.',
          callback_id: 'location',
          color: '#00a0e1',
          attachment_type: 'default',
          actions: [locationSelect, ...(enableCancel ? [cancelButton] : [])],
          text
        }
      ]
    }
  }

  locations () {
    const matchDay = env.matchDay.long
    const matchTime = env.matchTime.pretty

    return this.locationsPrompt(
      `Hi, I'm *Erna*. I organise lunch dates every ${matchDay} at ${matchTime}.\nAnd I will find one for you. Where are you located? 😊`,
      true
    )
  }

  updateLocations () {
    const matchDay = env.matchDay.long
    const matchTime = env.matchTime.pretty

    return this.locationsPrompt(
      `Let us update your lunch date for ${matchDay} at ${matchTime}.\nWhere are you located? 😊`,
      false
    )
  }

  duplicate (location) {
    const singleLocation = (env.locations.list.length === 1)

    const baseText = random([
      `You are already registered for the next lunch in ${location}😉.`,
      `Nope, sorry, you already signed up for ${location} 😉.`
    ])

    const actions = [...(singleLocation ? [] : [updateButton]), cancelDateButton]
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
}

module.exports = new Postman()
