const env = require('./env')

const locationSelect = (name) => ({
  name,
  type: 'select',
  text: 'Location',
  options: env.locations.list.map((location) => ({
    text: location,
    value: location
  }))
})

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

module.exports = {
  locationSelect,
  cancelButton,
  cancelDateButton,
  updateButton
}
