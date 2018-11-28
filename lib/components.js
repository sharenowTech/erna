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

module.exports = {
  locationsPrompt,
  updateLocationCancelButton,
  createLocationCancelButton,
  deleteLocationButton,
  updateLocationsPromptButton
}
