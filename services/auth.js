/**
 * Custom Authentication checker module
 */

'use strict'

var jwt = require('jsonwebtoken')
var config = require('../config/config')
var User = require('../models/User')

/**
 * Authentication Checker Middleware
 * For every secured API request, it checks for valid JWT token
 * @param  req  Request object
 * @param  res  Response object
 * @param  next Next function
 */
var AuthChecker = function (req, res, next) {
  if (req.headers && req.headers.authorization) {
    var token = req.headers.authorization
    var decoded
    try {
      decoded = jwt.verify(token, config.JWT_secret)
      User.findOne({
        _id: decoded.user_id
      }, function (err, user) {
        if (err) {
          res.status(500).json({status: 'ServerError', message: err})
        } else {
          req.loggedInUser = user
          return next()
        }
      })
    } catch (e) {
      res.status(401).json({status: 'Invalid', message: 'Invalid Token'})
    }
  } else {
    res.status(401).json({status: 'Invalid', message: 'Invalid or No Token'})
  }
}

module.exports = AuthChecker
