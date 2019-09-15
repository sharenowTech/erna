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
const notifyButton = (next) => [
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `Hiya, it's me, *Erna*. The next lunch date will be ${next}.\nThat's a tiny reminder 😉.\n\nWanna join and get to know new people?:curry:`
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
        "value": "hi"
      }
    ]
  }
]
/* eslint-enable quotes */

module.exports = {
  locationsPrompt,
  updateLocationCancelButton,
  createLocationCancelButton,
  deleteLocationButton,
  updateLocationsPromptButton,
  notifyButton
}
