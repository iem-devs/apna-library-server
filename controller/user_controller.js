/**
 * User Controller
 */

'use strict'

var Error = require('../models/Error')
var User = require('../models/User')
var schemaChecker = require('../services/schema')
var _ = require('lodash')

/**
 * Get User Object by ID
 * @api {get} /user/:id Get user by id
 * @apiParam {Number} id User's unique ID
 * @apiGroup User
 * @apiHeader Authorization JWT token
 * @apiUse UserModel
 */
exports.getUserById = function (req, res) {
  if (req.params.id && req.params.id !== '') {
    User.findOne({ _id: req.params.id }, function (err, user) {
      if (err) {
        res.status(404).json(Error('No User Found', 'No user found for this id'))
      } else {
        if (user) {
          res.status(200).json(user)
        } else {
          res.status(404).json(Error('No User Found', 'No user found for this id'))
        }
      }
    })
  } else {
    res.status(400).json(Error('BadReq', 'Bad Request'))
  }
}

/**
 * @api {POST} /user/update Update user details
 * @apiDescription update user details with existing user-id
 * @apiGroup User
 * @apiHeader Authorization JWT token
 * @apiUse UserModel
 */
exports.updateUser = function (req, res) {
  var user = req.body.user
  var loggedInUser = req.loggedInUser
  if (user && !_.isEmpty(user) && schemaChecker.checkSchema(User, user)) {
    user = _.pick(user, _.identity)
    User.update({
      _id: loggedInUser.id
    }, {$set: user}, function (err, user) {
      if (err) {
        res.status(401).json(Error('Unauthorized', 'Unauthorized to register'))
      } else {
        res.status(200).json(user)
      }
    })
  } else {
    res.status(400).json(Error('BadReq', 'Bad Request'))
  }
}

/**
 * @api {POST} /user/gcm/register
 * @apiParam {String} reg_token GCM Registration Token
 * @apiDescription Register GCM token from client to server
 * @apiGroup User
 * @apiHeader Authorization JWT token
 * @apiSuccess status Status Message
 */
exports.registerGcmToken = function (req, res) {
  var loggedInUser = req.loggedInUser
  var reg_token = req.body.reg_token
  if (reg_token && reg_token !== '') {
    User.update({_id: loggedInUser._id}, {
      $set: {
        gcm_id: reg_token
      }
    }, function (err, user) {
      if (err) {
        res.status(500).json(Error('ServerError', 'Error in saving gcm token'))
      } else {
        res.status(200).json({status: 'OK'})
      }
    })
  } else {
    res.status(400).json(Error('BadReq', 'Bad request or token not present'))
  }
}
