const qs = require('querystring')
const crypto = require('crypto')
const environment = require('./environment')

const denyAccess = (res) => res.status(401).json({
  statusCode: 401,
  error: 'Unauthorized'
})

module.exports = (req, res, next) => {
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

  const key = environment.secret
  const bodyParams = qs.stringify(req.body)
  const toSign = `v0:${timestamp}:${bodyParams}`
  const hash = `v0=${crypto.createHmac('sha256', key).update(toSign).digest('hex')}`

  if (hash !== signature) {
    return denyAccess(res)
  }

  next()
}
