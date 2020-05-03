/*
FileName : utils.js
Date : 2nd Aug 2018
Description : This file consist of utility functions
*/

const bcrypt = require('bcryptjs');

/* Generate hash for password */
module.exports.generatePasswordHash = async (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        reject(err);
      } else {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            reject(err);
          } else {
            resolve(hash);
          }
        });
      }
    });
  });
};

/* Compare password hash */
module.exports.comparePassword = async (originalPass, passToMatch) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(originalPass, passToMatch, (err, isMatch) => {
      if (err) {
        reject(err);
      } else {
        resolve(isMatch);
      }
    });
  });
};

