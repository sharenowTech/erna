const env = require('./env')

const locationPrompt = (name) => ({
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
  text: 'Cancel',
  style: 'danger',
  value: true
}

const deleteLocationButton = {
  name: 'delete.location',
  type: 'button',
  text: 'Cancel Date',
  value: true
}

const updateLocationPromptButton = {
  name: 'update.location.prompt',
  type: 'button',
  text: 'Update Date',
  value: true
}

module.exports = {
  locationPrompt,
  updateLocationCancelButton,
  createLocationCancelButton,
  deleteLocationButton,
  updateLocationPromptButton
}
