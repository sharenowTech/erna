const environment = require('./environment')

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

    this._confirmations = [
      { text: 'Awesome 🎉\nI will notify you at 11:30am about your match right here in Slack.' },
      { text: 'You wouldn\'t believe whom I\'ve found as your match!😱\nI\'ll tell you at 11:30am right here in Slack.' }
    ]

    this._nopes = [
      'Sorry, I didn\'t find anyone today. Try again tomorrow! 😊',
      'Sorry, there\'s no match today. But don\'t give up! 🤗'
    ]

    this.locations = {
      attachments: [
        {
          text: 'Hi, I\'m *Erna*. I will find a lunch date for you.\nWhere are you located? 😊',
          fallback: 'You are unable to choose a location 😔.',
          callback_id: 'location',
          color: '#00a0e1',
          attachment_type: 'default',
          actions: [
            {
              name: 'location',
              type: 'select',
              text: 'Location',
              options: environment.locations.map((location) => ({
                text: location,
                value: location.toLowerCase()
              }))
            },
            {
              name: 'cancel',
              type: 'button',
              text: 'Cancel',
              style: 'danger',
              value: true
            }
          ]
        }
      ]
    }
  }

  random (list) {
    return list[Math.floor(Math.random() * list.length)]
  }

  linkMatches (matches) {
    const links = matches.map(x => `<@${x}>`)
    const last = links.pop()

    return [links.join(', '), last].join(' & ')
  }

  get confirmation () {
    return this.random(this._confirmations)
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
}

module.exports = new Postman()
