const env = require('./env')

const locationsPrompt = (name) => ({
  name,
  type: 'select',
  text: 'Location',
  options: env.locations.list.map((location) => ({
    text: location,
    value: location
  }))
})

const createLocationCancelButton = {
  name: 'create.location.cancel',
  type: 'button',
  text: 'Cancel',
  style: 'danger',
  value: true
}

const updateLocationCancelButton = {
  name: 'update.location.cancel',
  type: 'button',
  text: 'Nevermind',
  style: 'danger',
  value: true
}

const deleteLocationButton = {
  name: 'delete.location',
  type: 'button',
  text: 'Cancel Date',
  value: true
}

const updateLocationsPromptButton = {
  name: 'update.location.prompt',
  type: 'button',
  text: 'Update Date',
  value: true
}

/* eslint-disable quotes */
/* eslint-disable quote-props */
const notifyButton = (msg = '') => [
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `Hiya, it's me, *Erna*.\nJust want to briefly remind you of our regular lunch dates.\nWanna join and get to know new folks?🍛😉 ${msg}.`
    }
  },
  {
    "type": "actions",
    "elements": [
      {
        "action_id": "notify.prompt",
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Join lunch dates",
          "emoji": true
        },
        "value": "true"
      },
      {
        "action_id": "notify.ignore",
        "type": "button",
        "style": "danger",
        "text": {
          "type": "plain_text",
          "text": "No thanks!",
          "emoji": true
        },
        "value": "true"
      }
    ]
  }
]
/* eslint-enable quote-props */
/* eslint-enable quotes */

module.exports = {
  locationsPrompt,
  updateLocationCancelButton,
  createLocationCancelButton,
  deleteLocationButton,
  updateLocationsPromptButton,
  notifyButton
}
