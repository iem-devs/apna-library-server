/**
 * Routes for the API
 */

'use strict'

var express = require('express')
var router = express.Router()
var AuthChecker = require('../services/auth.js')
var BooksController = require('../controller/books_controller')

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

/**
 * Authentication Test Stub
 */

router.get('/secret', AuthChecker, function (req, res) {
  res.json({
    message: 'Success!'
  })
})

router.get('/books', BooksController.getAllBooks)

module.exports = router
