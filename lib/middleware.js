const rawBody = (req, res, buf, encoding) => {
  req.rawBody = buf && buf.length ? buf.toString(encoding || 'utf8') : undefined
}

const async = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch(next)
}

module.exports = {
  rawBody,
  async
}
