/**
 * User Authentication Controller
 * controlling login and registration module
 */

'use strict'

var Error = require('../models/Error')
var User = require('../models/User')
var jwt = require('../services/jwt')
var sms = require('../services/sms')
var bcrypt = require('bcrypt')
var SALT_WORK_FACTOR = 10

/**
 * @api {POST} /register Register New User
 * @apiVersion 0.0.2
 * @apiName registerNewUser
 * @apiGroup User
 *
 * @apiDescription Register new user
 * @apiSuccess {String} user_id UserID.
 */
exports.registerNewLocalUser = function (req, res) {
  var email = req.body.email
  var password = req.body.password
  var username = req.body.username
  var govt = req.body.govt === 'yes'
  if (email && email !== '' && password && password !== '') {
    // check for duplicate email id
    User.find({email: email}, function (err, exUser) {
      if (err) {
        res.status(500).json(Error('ServerError', 'Problem with register'))
      }
      if (!exUser || exUser.length > 0) {
        res.status(409).json(Error('DuplicateUser', 'User already present with this email id'))
      } else {
        var user = new User({
          email: email,
          password: password,
          loginBy: 'local',
          verified: false,
          username: username,
          government: govt
        })
        user.save(function (err, user) {
          if (err) {
            res.status(500).json(Error('ServerError', 'Problem with register'))
          }
          res.status(200).json({user_id: user.id})
        })
      }
    })
  } else {
    res.status(400).json(Error('BadReq', 'Bad Request or no params'))
  }
}

/**
 * @api {POST} /login/local
 * @apiDescription API endpoint to perform secure login with Local Credentials
 * @apiParam {String} email Email
 * @apiParam {String} password Password
 * @apiGroup User
 * @apiSuccess {String} user_id UserID
 * @apiSuccess {String} access_token Access token, to be passed as Authorization Header
 * @apiSuccess {String} new_user Boolean Flag
 */
exports.loginWithLocal = function (req, res) {
  var email = req.body.email
  var password = req.body.password
  if (email && email !== '' && password && password !== '') {
    User.findOne({
      email: email,
      verified: true
    }, function (err, user) {
      if (err) {
        res.status(401).json(Error('InvalidLogin', 'Invalid Login Credentials'))
      }
      if (user) {
        user.comparePassword(password, function (err, isMatch) {
          if (err) {
            res.status(500).json(Error('ServerError', 'Password matching server error'))
          }
          if (isMatch) {
            var access_token = jwt.sign(user.id, user.email)
            res.status(200).json({
              user_id: user.id,
              access_token: access_token,
              new_user: false
            })
          } else {
            res.status(401).json(Error('InvalidLogin', 'Invalid Password'))
          }
        })
      } else {
        res.status(401).json(Error('InvalidLogin', 'Invalid Login Credentials or User not verified'))
      }
    })
  } else {
    res.status(400).json(Error('BadReq', 'Bad Request or no params'))
  }
}

/**
 * @api {get} /login/otp Request OTP
 * @apiParam {String} user_id User ID
 * @apiParam {Number} phone Mobile phone number
 * @apiGroup User
 * @apiSuccess {String} status Status message
 */
exports.requestOTP = function (req, res) {
  var phone = req.query.phone
  var user_id = req.query.user_id
  if (phone && phone !== '' && user_id && user_id !== '') {
    if (phone.length === 10) {
      phone = '+91' + phone
      User.findOne({_id: user_id}, function (err, user) {
        if (err) {
          res.status(500).json(Error('ServerError', 'ServerError'))
        }
        if (user) {
          if (user.verified) {
            res.status(403).json(Error('OTP Verified', 'OTP Already Verified'))
          } else {
            User.update({_id: user._id}, {phone: phone}).exec()
            sms.generateToken(phone, function (err, token) {
              if (err) {
                res.status(500).json(Error('SMSError', 'SMS Gateway Error'))
              }
              User.update({_id: user._id}, {token: token}).exec()
              // res.status(200).json({status: 'SMS Sent with OTP'})
              res.status(200).json({status: 'OTP Generated : ' + token})
            })
          }
        } else {
          res.status(404).json(Error('UserNotFound', 'User Not found by ID'))
        }
      })
    } else {
      res.status(401).json(Error('InvalidPhone', 'Only support 10 digit Indian phone'))
    }
  } else {
    res.status(400).json(Error('BadReq', 'Bad Request or no params'))
  }
}

/**
 * @api {get} /login/otp/verify Verify OTP
 * @apiParam {String} user_id User ID
 * @apiParam {Number} phone Mobile phone number
 * @apiGroup User
 * @apiSuccess {String} status Status Message
 * @apiSuccess {String} access_token Access Token
 */
exports.verifyOTP = function (req, res) {
  var user_id = req.query.user_id
  var token = req.query.otp
  if (user_id && user_id !== '' && token && token !== '') {
    sms.verifyToken(token, user_id, function (err, stat) {
      if (err) {
        res.status(500).json(Error('ServerError', 'Token Verification error'))
      }
      if (stat) {
        User.update({_id: user_id}, {verified: true}).exec()
        User.findOne({_id: user_id}, function (err, user) {
          if (err) {
            res.status(500).json(Error('ServerError', 'Error retrieving using'))
          } else {
            var access_token = jwt.sign(user.id, user.email)
            res.status(200).json({status: 'OTP Successfully Verified', access_token: access_token})
          }
        })
      } else {
        res.status(401).json({status: 'OTP Mismatch'})
      }
    })
  } else {
    res.status(400).json(Error('BadReq', 'Bad Request or no params'))
  }
}

/**
 * @api {get} /login/forgotp Forgot Password
 * @apiDescription Return with OTP to reverify with new password
 * @apiParam {String} email Email ID
 * @apiGroup User
 * @apiSuccess {String} status Status message
 * @apiSuccess {String} token OTP token (only for testing purpose)
 * @apiSuccess {String} id UserID
 */
exports.forgotPassword = function (req, res) {
  var user_email = req.query.email
  if (user_email && user_email !== '') {
    User.findOne({email: user_email}, function (err, user) {
      if (err) {
        res.status(500).json(Error('ServerError', 'ServerError'))
      }
      if (user) {
        sms.generateToken(user.phone, function (err, token) {
          if (err) {
            res.status(500).json(Error('SMSError', 'SMS Gateway Error'))
          }
          User.update({_id: user._id}, {token: token}).exec()
          // res.status(200).json({status: 'SMS Sent with OTP'})
          res.status(200).json({status: 'OTP Generated', token: token, id: user._id})
        })
      } else {
        // no user found with the email
        res.status(404).json(Error('NoUserFound', 'No User Found with this email'))
      }
    })
  } else {
    res.status(400).json(Error('BadReq', 'Bad Request or no params'))
  }
}

/**
 * @api {POST} /login/forgotp Reset Password
 * @apiDescription Update forgotten password with new password
 * @apiParam {String} id User ID
 * @apiParam {String} password New Password
 * @apiParam {Number} otp OTP
 * @apiGroup User
 * @apiSuccess {String} status Status message
 */
exports.forgotPasswordUpdate = function (req, res) {
  var id = req.body.id
  var new_pass = req.body.password
  var otp = req.body.otp
  if (id && id !== '' && id.match(/^[0-9a-fA-F]{24}$/) && new_pass &&
    new_pass !== '' && otp && otp !== '') {
    User.findOne({_id: id}, function (err, user) {
      if (err) {
        res.status(500).json(Error('ServerError', 'ServerError'))
      }
      if (user) {
        if (user.token === otp) {
          // hashing the password
          bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err) {
              res.status(500).json(Error('ServerError', 'ServerError in password hashing'))
            }
            bcrypt.hash(new_pass, salt, function (err, hash) {
              if (err) {
                res.status(500).json(Error('ServerError', 'ServerError in password hashing'))
              }
              new_pass = hash
              User.update({
                _id: id
              }, {$set: {password: new_pass}}, function (err, user) {
                if (err) {
                  res.status(500).json(Error('ServerError', 'ServerError in updating'))
                } else {
                  res.status(200).json({status: 'OK'})
                }
              })
            })
          })
        } else {
          res.status(401).json(Error('OTPMismatch', 'OTP Mismatch'))
        }
      } else {
        res.status(404).json(Error('NoUserFound', 'No User Found with this ID'))
      }
    })
  } else {
    res.status(400).json(Error('BadReq', 'Bad Request or no params'))
  }
}
