const {Server} = require('../models')

module.exports.validateServerExistence = async (req, res, next) => {
  const path = req.path.replace(/\/?/, '')
  const servers = await Server.find({})

  for (let server of servers) {
    // We'll use the first server to match the prefix.
    if (path.match(new RegExp(`^${server.prefix}`))) {
      req.cleanPath = path // This seems dangerous.
      req.server = server
      return next()
    }
  }

  return res.status(404).send('No registered service could handle your request')
}