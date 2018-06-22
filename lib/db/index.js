const mongoose = require('mongoose')

let mongoConnectionUrl = 'mongodb://'

if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
  mongoConnectionUrl += `${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@`
}

const mongodbHost = process.env.MONGODB_HOST || 'localhost'
const mongodbPort = process.env.MONGODB_PORT || 27017

mongoConnectionUrl += `${mongodbHost}:${mongodbPort}/${process.env.MONGODB_DB || 'gateway'}`

mongoose.connect(mongoConnectionUrl)

module.exports = mongoose