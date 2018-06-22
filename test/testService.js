const http = require('http')

const express = require('express')
const app = new express()

app.get('/find/:id', (req, res) => {
  return res.json({
    name: 'Christian Roman',
    id: req.params.id
  })
})

app.get('/products/:id', (req, res) => {
  return res.json({
    name: 'Handbag',
    id: req.params.id
  })
})

app.get('/headers', (req, res) => {
  return res.json(req.headers)
})

app.get('/params', (req, res) => {
  return res.json(req.query)
})

const server = http.createServer(app)

const port = parseInt(process.env.HTTP_PORT) + 1

server.listen(port)

module.exports = server