const crypto = require('crypto')
const env = require('./env')

const hmac = (timestamp, body) => {
  const key = env.secret
  const toSign = `v0:${timestamp}:${body}`

  return `v0=${crypto.createHmac('sha256', key).update(toSign).digest('hex')}`
}

const verify = (req) => {
  const {
    'x-slack-signature': signature,
    'x-slack-request-timestamp': timestamp
  } = req.headers

  const timestampMs = timestamp * 1000
  const timeDelta = Date.now() - timestampMs
  const deltaThreshold = 1000 * 60 * 5

  if (timeDelta > deltaThreshold) {
    console.info('Verification failed: time threshold exceeded.')
    return false
  }

  if (hmac(timestamp, req.rawBody) !== signature) {
    console.info('Verification failed: signature does not match.')
    return false
  }

  return true
}

const lock = (req, res, next) => {
  if (verify(req)) {
    return next()
  }

  return res.status(401).json({
    statusCode: 401,
    error: 'Unauthorized'
  })
}

module.exports = {
  hmac,
  verify,
  lock
}
