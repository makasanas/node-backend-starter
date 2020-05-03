/*
FileName : checkToken.js
Date : 2nd Aug 2018
Description : This file consist of middleware functions to use while requesting data
*/

const jwt = require('jsonwebtoken');
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse, UserRoles } = require('./../helpers/common');

// validates access token for user
exports.validateToken = function (req, res, next) {

  /* Contruct response object */
  let rcResponse = new ApiResponse();

  // check header or url parameters or post parameters for token
  const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

  // decode token
  if (token) {
    // verifies secret
    jwt.verify(token, process.env['SECRET'], function (err, decoded) {
      if (err) {
        SetResponse(rcResponse, 403, RequestErrorMsg('InvalidToken', req, null), false);
        let httpStatus = 403;
        return res.status(httpStatus).send(rcResponse);
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    SetResponse(rcResponse, 401, RequestErrorMsg('InvalidToken', req, null), false);
    let httpStatus = 401;
    return res.status(httpStatus).send(rcResponse);
  }
};

// check if the requesting user is Admin user
module.exports.isAdminUser = async (req, res, next) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();

  const roles = new UserRoles();
  if (req.decoded.role !== roles.admin) {
    SetResponse(rcResponse, 403, RequestErrorMsg('NotAuthorized', req, null), false);
    httpStatus = 403;
    return res.status(httpStatus).send(rcResponse);
  } else {
    next();
  }
};

// check if the requesting user is restaurant owner
module.exports.isOwner = async (req, res, next) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();

  const roles = new UserRoles();
  if (req.decoded.role !== roles.owner) {
    SetResponse(rcResponse, 403, RequestErrorMsg('NotAuthorized', req, null), false);
    httpStatus = 403;
    return res.status(httpStatus).send(rcResponse);
  } else {
    next();
  }
};

/* Check if requesting user is owner or admin user */
module.exports.isOwnerOrAdmin = async (req, res, next) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();

  const roles = new UserRoles();
  if (req.decoded.role === roles.user) {
    SetResponse(rcResponse, 403, RequestErrorMsg('NotAuthorized', req, null), false);
    httpStatus = 403;
    return res.status(httpStatus).send(rcResponse);
  } else {
    next();
  }
};