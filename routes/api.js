/**
 * Routes for the API
 */

'use strict'

var express = require('express')
var router = express.Router()

/**
 * API Root
 */

router.get('/', function (req, res) {
  res.json({
    version: 1.0
  })
})

router.get('/status', function (req, res) {
  res.status(200).json({
    status: 'OK',
    version: 1.0,
    timestamp: new Date().getTime()
  })
})

module.exports = router
