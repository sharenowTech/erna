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
    return matches.map(x => `<@${x}>`).join(' & ')
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
    return `Your lunch date: ${this.linkMatches(matches)}.\nGet in touch and enjoy your lunch! 😋`
  }
}

module.exports = new Postman()