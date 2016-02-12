/**
 * SMS Sender Service
 * Currently not using Twilio, just sending back the token
 */

// var config = require('../config/config')
// var client = require('twilio')(config.twilio.accountSid, config.twilio.authToken)
var User = require('../models/User')

exports.generateToken = function (number, cb) {
  var token = getRandomInt(1000, 9999)
  cb(null, token)
/*
client.messages.create({
  body: 'OTP for Transparency APP : ' + token,
  to: number,
  from: '+14046206099'
}, function (err, message) {
  if (err) {
    return cb(err)
  } else {
    cb(null, token)
  }
})
*/
}

exports.verifyToken = function (userToken, userId, cb) {
  User.findOne({_id: userId}, function (err, user) {
    if (err) return cb(err)
    if (user.token === parseInt(userToken, 10)) {
      cb(null, true)
    } else {
      cb(null, false)
    }
  })
}

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
