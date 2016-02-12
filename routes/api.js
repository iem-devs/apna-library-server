/**
 * Routes for the API
 */

'use strict'

var express = require('express')
var router = express.Router()
var AuthChecker = require('../services/auth.js')
var BooksController = require('../controller/books_controller')
var UserController = require('../controller/user_controller')
var UserAuthController = require('../controller/user_auth')

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

/**
 * Login apis
 */

router.post('/login/local', UserAuthController.loginWithLocal)
router.post('/register', UserAuthController.registerNewLocalUser)
router.get('/login/otp', UserAuthController.requestOTP)
router.get('/login/otp/verify', UserAuthController.verifyOTP)
router.get('/login/forgotp', UserAuthController.forgotPassword)
router.post('/login/forgotp', UserAuthController.forgotPasswordUpdate)

/**
 * User apis
 */

router.get('/user/:id', AuthChecker, UserController.getUserById)
router.post('/user/update', AuthChecker, UserController.updateUser)
router.post('/user/gcm/register', AuthChecker, UserController.registerGcmToken)

router.get('/books', BooksController.getAllBooks)

module.exports = router
