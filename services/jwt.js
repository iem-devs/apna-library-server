/**
 * Module to generate signed JWT tokens
 */

'use strict'

var config = require('../config/config')
var jwt = require('jsonwebtoken')

exports.sign = function (user_id, email) {
  return jwt.sign({ user_id: user_id, email: email }, config.JWT_secret)
}
