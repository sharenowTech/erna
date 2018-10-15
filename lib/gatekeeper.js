const crypto = require('crypto')
const environment = require('./environment')

const hmac = (timestamp, body) => {
  const key = environment.secret
  const toSign = `v0:${timestamp}:${body}`

  return `v0=${crypto.createHmac('sha256', key).update(toSign).digest('hex')}`
}

const sign = (req) => {
  const timestamp = parseInt(Date.now() / 1000, 10)

  return {
    'x-slack-signature': hmac(timestamp, req.rawBody),
    'x-slack-request-timestamp': timestamp
  }
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
    return false
  }

  if (hmac(timestamp, req.rawBody) !== signature) {
    return false
  }

  return true
}

const lock = (req, res, next) => {
  if (!verify(req)) {
    return res.status(401).json({
      statusCode: 401,
      error: 'Unauthorized'
    })
  }

  next()
}

module.exports = {
  lock,
  hmac,
  sign,
  verify
}
