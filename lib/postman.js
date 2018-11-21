const env = require('./env')
const scheduler = require('./scheduler')
const {
  locationsPrompt,
  createLocationCancelButton,
  updateLocationCancelButton,
  updateLocationsPromptButton,
  deleteLocationButton
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
    const enableCancel = name !== 'update.location'

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
      'Seems like no one\'s in the mood for company today! 🙁',
      'Tell your colleagues about me, maybe it will work out next time ☝️.'
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
    const { date, isCustom } = await scheduler.getNext(location)

    const baseText = random([
      `Awesome 🎉\nI will notify you ${date} about your match right here in Slack.`,
      `You wouldn't believe whom I've found as your match!😱\nI'll tell you ${date} right here in Slack.`,
      `Whoo-hoo! I'm glad you joined!🎉\nI already have your perfect lunch date but I can't tell you until ${date}.`,
      `I'm afraid that I' m not sure if you already know each other 🤔.\nWell, you'll find out ${date}.`
    ])

    return { text: isCustom ? `${baseText}\n\nFYI: it's a scheduled onetime event in ${location} 🎉.` : baseText }
  }

  locationsPrompt (isNewbie, command) {
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
    const matchDay = env.matchDay.long
    const matchTime = env.matchTime.pretty

    const text = random([
      `Let us update your lunch date next ${matchDay} at ${matchTime}.\nWhere are you located? 😊`,
      `What list can I put you on instead?😊\nThe next lunch date next ${matchDay} at ${matchTime}.`,
      `Have you changed your mind? 😉\nWhere do you want to meet someone for lunch next ${matchDay} at ${matchTime}?`
    ])

    return this._locations(text, 'update.location')
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
}

module.exports = new Postman()
