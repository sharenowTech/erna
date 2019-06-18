const env = require('./env')
const texts = require('./texts')

const random = (list) => list[Math.floor(Math.random() * list.length)]

const signup = (isNewbie) => {
  const matchDay = env.matchDay.long
  const matchTime = env.matchTime.pretty
  const frequency = env.matchInterval.frequency(matchDay)
  const text = random((isNewbie ? texts.signupNewbie : texts.signup)(frequency, matchTime))

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Where are you located?:blush:'
      },
      accessory: {
        action_id: 'signup',
        type: 'static_select',
        placeholder: {
          type: 'plain_text',
          text: 'Location'
        },
        options: env.locations.list.map((location) => ({
          text: {
            type: 'plain_text',
            text: location
          },
          value: location
        }))
      }
    }
  ]
}

module.exports = {
  signup
}
