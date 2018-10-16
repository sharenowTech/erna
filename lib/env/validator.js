module.exports = class Validator {
  constructor (schema) {
    Object.keys(schema).forEach(key => {
      const def = schema[key]
      let value = process.env[key]

      if (def.props && def.transform) {
        throw new Error(`Use either 'props' or 'transform' on ${key}.`)
      }

      if (def.required && value === undefined) {
        throw new Error(`Please provide ${def.desc} as '${key}'.`)
      }

      if (def.pattern && value !== undefined && !value.match(def.pattern)) {
        throw new Error(`Please provide format the '${key}' variable like listed in the docs.`)
      }

      value = value === undefined ? def.default : value

      if (def.transform) {
        value = def.transform(value)
      }

      this[def.name] = value

      if (def.props) {
        this[def.name] = {}

        Object.keys(def.props).forEach(prop => {
          this[def.name][prop] = def.props[prop](value)
        })
      }
    })
  }
}
