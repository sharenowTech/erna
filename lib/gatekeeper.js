const crypto = require('crypto')
const environment = require('./environment')

const denyAccess = (res) => res.status(401).json({
  statusCode: 401,
  error: 'Unauthorized'
})

const hash = (timestamp, body) => {
  const key = environment.secret
  const toSign = `v0:${timestamp}:${body}`

  return `v0=${crypto.createHmac('sha256', key).update(toSign).digest('hex')}`
}

const lock = (req, res, next) => {
  const {
    'x-slack-signature': signature,
    'x-slack-request-timestamp': timestamp
  } = req.headers

  const timestampMs = timestamp * 1000
  const timeDelta = Date.now() - timestampMs
  const deltaThreshold = 1000 * 60 * 5

  if (timeDelta > deltaThreshold) {
    return denyAccess(res)
  }

  if (hash(timestamp, req.rawBody) !== signature) {
    return denyAccess(res)
  }

  next()
}

module.exports = {
  lock,
  hash
}
