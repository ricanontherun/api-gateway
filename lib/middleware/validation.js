const {Server} = require('../models')

module.exports.validateRegistrationRequest = async (req, res, next) => {
  const errors = []
  const requestBody = req.body

  if (!requestBody.hasOwnProperty('prefix')) {
    errors.push('Missing prefix')
  } else {
    if (typeof requestBody.prefix !== 'string') {
      errors.push('Invalid prefix')
    } else {
      const existing = await Server.findOne({prefix: requestBody.prefix.toLowerCase().trim()})

      if (existing) {
        errors.push('Service prefix is already in use.')
      }
    }
  }

  if (!requestBody.hasOwnProperty('label')) {
    errors.push('Missing label')
  } else {
    if (typeof requestBody.label !== 'string') {
      errors.push('label must be a string')
    }
  }

  if (!requestBody.hasOwnProperty('baseUrl')) {
    errors.push('Missing baseUrl')
  } else {
    if (typeof requestBody.baseUrl !== 'string') {
      errors.push('baseUrl must be a string')
    } else {
      // Validate that this is a legit URL.
    }
  }

  if (errors.length) {
    return res.status(400).json(errors)
  }

  return next()
}