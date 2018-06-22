const mongoose = require('mongoose')
require('../db')

const Server = mongoose.Schema({
  label: {
    type: String,
    lowercase: true,
    trim: true,
    required: true
  },

  prefix: {
    type: String,
    lowercase: true,
    trim: true,
    required: true
  },

  stripPrefix: {
    type: Boolean,
    default: true
  },

  baseUrl: {
    type: String,
    lowercase: true,
    trim: true,
    required: true
  },

  allowedParams: {
    type: Array,
    default: []
  },

  allowedHeaders: {
    type: Array,
    default: []
  }
})

module.exports = mongoose.model('Server', Server)
