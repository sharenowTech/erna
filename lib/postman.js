const env = require('./env')
const scheduler = require('./scheduler')

const locationSelect = {
  name: 'location',
  type: 'select',
  text: 'Location',
  options: env.locations.list.map((location) => ({
    text: location,
    value: location.toLowerCase()
  }))
}

const cancelButton = {
  name: 'cancel',
  type: 'button',
  text: 'Cancel',
  style: 'danger',
  value: true
}

class Postman {
  constructor () {
    this._cancels = [
      { text: 'That\'s a pity, but maybe next time! 🙃' },
      { text: 'Too bad, but maybe tomorrow! 🙃' },
      { text: 'C\'mon, your colleagues don\'t bite 😬.' }
    ]

    this._duplicates = [
      { text: 'You are already registered for the next lunch 😉.' },
      { text: 'Nope, sorry, but you already signed up today 😉.' },
      { text: 'Sorry, you have to wait a little longer 🙃.' }
    ]

    this._nopes = [
      'Sorry, I didn\'t find anyone today. Try again tomorrow! 😊',
      'Sorry, there\'s no match today. But don\'t give up! 🤗'
    ]

    this.error = 'An error occurred. Please try again later or contact the person in charge.'
  }

  random (list) {
    return list[Math.floor(Math.random() * list.length)]
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
    return this.random(this._cancels)
  }

  get duplicate () {
    return this.random(this._duplicates)
  }

  get nope () {
    return this.random(this._nopes)
  }

  hooray (matches) {
    const links = this.linkMatches(matches)

    return this.random([
      `Your lunch date: ${links}.\nGet in touch and enjoy your lunch! 😋`,
      `As promised, I have a lunch date for you! 🎉\nGet in touch with ${links}.`,
      `Surely you have waited already for your date! 😉\n Drop ${links} a line and enjoy your lunch.`
    ])
  }

  hoorayAll (matches) {
    const links = this.linkMatches(matches)

    return this.random([
      `Hi ${links} – you have been matched for a lunch date!\nGet in touch with each other and enjoy your lunch! 😋`,
      `Hiya ${links}!\nAs promised, I have organized a lunch date! 🎉\nSettle the details and enjoy your lunch!`,
      `Surely you have waited already for your date! 😉\nWell you – ${links} – have matched.\nI hope you're looking forward to meeting each other and enjoying your lunch.`
    ])
  }

  confirmation (city) {
    const matchDate = scheduler.getNext(city)

    return this.random([
      { text: `Awesome 🎉\nI will notify you ${matchDate} about your match right here in Slack.` },
      { text: `You wouldn't believe whom I've found as your match!😱\nI'll tell you ${matchDate} right here in Slack.` }
    ])
  }

  locations () {
    const matchDay = env.matchDay.long
    const matchTime = env.matchTime.pretty

    return {
      attachments: [
        {
          text: `Hi, I'm *Erna*. I organise lunch dates every ${matchDay} at ${matchTime}.\nAnd I will find one for you. Where are you located? 😊`,
          fallback: 'You are unable to choose a location 😔.',
          callback_id: 'location',
          color: '#00a0e1',
          attachment_type: 'default',
          actions: [locationSelect, cancelButton]
        }
      ]
    }
  }
}

module.exports = new Postman()
