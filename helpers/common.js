/*
FileName : common.js
Date : 2nd Aug 2018
Description : This file consist of functions that can be used through the application
*/

const ErrMessages = {
  ISE: 'Internal server error',
  InvalidParams: 'Invalid body parameters',
  NotAuthorized: 'You are not authorized to perform this operation',
  EmailExists: 'This email is already registered in the system, please try different email.',
  InvalidPassword: 'Email or password is incorrect',
  InvalidToken: 'Access token is invalid',
  InvalidAdminKey: 'Invalid Admin key',
  NoImage: 'Please select a valid image file',
  RestaurantExists: 'A restaurant with the same name exists, please try with another name',
  userNotFound: 'User not found'
};

/**
 * a function to handle responses as then one we use in middleware is not flexible enough
 * @param {object} respObj
 * @param {Int} code
 * @param {String} message
 * @param {Boolean} success
 * @param {Object} data
 */
const SetResponse = (respObj, code = 1, message = 'OK', success = true, data = {}) => {
  respObj.code = code;
  respObj.success = success;
  respObj.message = message;
  respObj.data = data;
  return respObj;
};

/**
 * RequestErrorMsg
 * constructs a meaningful Error Message
 * @param {string} errKey
 * @param {object} requestObj
 * @param {object} errorObj
 * @returns {string} a string prompt describing the error and it's place in api
 */
const RequestErrorMsg = (errKey, requestObj = null, errorObj = null) => {
  return `${(errorObj !== null) ? errorObj.message : ''}\
  ${(errKey !== null) ? ErrMessages[errKey] : ''}`;
};


/**
 * UserRoles
 * returns the assigned numbers according to user's roles
 * @returns {number} number assigned to user role
 */
function UserRoles() {
  this.admin = 1;
  this.user = 2;
  this.owner = 3;
};

/**
 * ApiResponse
 * constructs response object
 * @returns {object} response object
 */
function ApiResponse() {
  this.success = true;
  this.message = "OK";
  this.code = 0;
  this.data = {};
};

module.exports = {
  SetResponse,
  ErrMessages,
  RequestErrorMsg,
  UserRoles,
  ApiResponse
};