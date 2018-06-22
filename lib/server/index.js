const http = require('http')
const https = require('https')
const fs = require('fs')

const express = require('express')
const morgan = require('morgan')
const request = require('request')
const bodyParser = require('body-parser')
const {pick} = require('lodash')

const {Server} = require('../models/index')
const {validation, proxy} = require('../middleware/index')

const app = new express()
const appServers = []

const handlePostServer = (req, res) => {
  return Server.create(req.body)
    .then(() => {
      return res.status(201).send('ok')
    })
    .catch((err) => {
      console.error(err)
      return res.status(500).send('An error occurred!')
    })
}

const handleDeleteServer = (req, res) => {
  return res.send('deleting an existing server.')
}

const handleUpdateServer = (req, res) => {
  return res.send('updating an existing service registration')
}

const handleGetServers = (req, res) => {
  return Server.find({}).then((servers) => {
    res.json(servers)
  })
}

const handleGatewayDispatch = (req, res) => {
  const server = req.server
  const path = req.cleanPath

  const serverPath = server.stripPrefix ? path.replace(server.prefix, '') : path

  const serverRequest = request(serverPath, {
    baseUrl: server.baseUrl,
    method: req.method,
    qs: pick(req.query, server.allowedParams),
    headers: pick(req.headers, server.allowedHeaders)
  })

  return serverRequest
    .on('error', (err) => {
      console.error(err)
      res.status(500).send('An error occurred')
    })
    .pipe(res)
}

app.use(morgan('combined'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/gateway/servers', handleGetServers)
app.post('/gateway/servers', [validation.validateRegistrationRequest], handlePostServer)
app.put('/gateway/servers/:label', handleUpdateServer)
app.delete('/gateway/servers/:label', handleDeleteServer)

// Gateway matching route
app.all(`*`, [proxy.validateServerExistence], handleGatewayDispatch)

const httpPort = parseInt(process.env.HTTP_PORT)

if (httpPort) {
  appServers.http = http.createServer(app)

  appServers.http.listen(httpPort, (err) => {
    if (err) {
      return console.error(`Failed to start http server: ${err}`)
    }

    console.log(`Listening on http://localhost:${httpPort}`)
  })
}

const httpsPort = parseInt(process.env.HTTPS_PORT)

if (httpsPort) {
  const sslCredentials = {
    key: fs.readFileSync(process.env.PATH_TO_SSL_KEY),
    cert: fs.readFileSync(process.env.PATH_TO_SSL_CERT)
  }

  appServers.https = https.createServer(sslCredentials, app)

  appServers.https.listen(httpsPort, (err) => {
    if (err) {
      return console.error(`Failed to start https server: ${err}`)
    }

    console.log(`Listening on https://localhost:${httpsPort}`)
  })
}

module.exports = appServers