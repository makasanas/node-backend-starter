/*
FileName : authCtrl.js
Date : 2nd Aug 2018
Description : This file consist of functions related to user's authentication
*/

/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const jwt = require('jsonwebtoken');
const userModel = require('./../models/usersModel');
const utils = require('./../helpers/utils');
const ObjectId = require('mongoose').Types.ObjectId;

/* Authenticate user */
module.exports.login = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  /* Check body params */
  if (!req.body.email || !req.body.password) {
    SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
    httpStatus = 400;
    return res.status(httpStatus).send(rcResponse);
  }

  try {
    /* Check if email exists */
    const findUser = await userModel.findOne({ email: req.body.email }).lean().exec();
    if (findUser) {
      /* Compare password */
      const comparePassword = await utils.comparePassword(req.body.password, findUser.password);

      if (comparePassword) {
        /* Password matched */
        const encodedData = {
          userId: findUser._id,
          role: findUser.role
        };
        // generate accessToken using JWT
        const token = jwt.sign(encodedData, process.env['SECRET']);

        const userObj = {
          _id: findUser._id,
          role: findUser.role,
          name: findUser.name,
          email: findUser.email,
          phone: findUser.phone,
          token: token
        };
        rcResponse.data = userObj;
      } else {
        SetResponse(rcResponse, 403, RequestErrorMsg('InvalidPassword', req, null), false);
        httpStatus = 403;
        return res.status(httpStatus).send(rcResponse);
      }
    } else {
      SetResponse(rcResponse, 403, RequestErrorMsg('InvalidPassword', req, null), false);
      httpStatus = 403;
      return res.status(httpStatus).send(rcResponse);
    }
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Register user */
module.exports.register = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  /* Check body params */
  if (!req.body.email || !req.body.password || !req.body.name || !req.body.phone || !req.body.type) {
    SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
    httpStatus = 400;
    return res.status(httpStatus).send(rcResponse);
  }

  /* Check admin Key, if it's Admin user */
  if (req.body.adminKey !== process.env['ADMIN_KEY']) {
      SetResponse(rcResponse, 401, RequestErrorMsg('InvalidAdminKey', req, null), false);
      httpStatus = 401;
      return res.status(httpStatus).send(rcResponse);
  }

  try {
    const passHash = await utils.generatePasswordHash(req.body.password);
    const userObj = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: passHash,
      role: parseInt(req.body.type)
    };

    const createUser = await userModel.create(userObj);

    const encodedData = {
      userId: createUser._id,
      role: createUser.role
    };
    // generate accessToken using JWT
    const token = jwt.sign(encodedData, process.env['SECRET']);

    rcResponse.data = { _id: createUser._id, role: createUser.role, name: createUser.name, email: createUser.email, phone: createUser.phone, token: token };
  } catch (err) {
    if (err.code === 11000) {
      SetResponse(rcResponse, 400, RequestErrorMsg('EmailExists', req, null), false);
      httpStatus = 400;
    } else {
      SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
      httpStatus = 500;
    }
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Get user's profile information */
module.exports.getUserProfile = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  try {
    const { decoded } = req;
    const userData = await userModel.findOne({ _id: decoded.userId, deleted: false }, { password: 0 }).lean().exec();
    rcResponse.data = userData;
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Update user details */
module.exports.userUpdate = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  try {
    let userObj = {
      name: req.body.name != undefined ? req.body.name : undefined,
      email: req.body.email != undefined ? req.body.email : undefined,
      phone: req.body.phone != undefined ? req.body.phone : undefined,
    };
    userObj = JSON.parse(JSON.stringify(userObj));
    const updateUser = await userModel.findByIdAndUpdate({ _id: req.params.userId }, { $set: userObj }, { new: true, runValidators: true }).lean().exec();
    delete updateUser.password;
    rcResponse.data = updateUser;
    rcResponse.message = 'User details has been updated successfully';
    // } else {
    //   SetResponse(rcResponse, 400, RequestErrorMsg('EmailExists', req, null), false);
    //   httpStatus = 400;
    // }
  } catch (err) {
    console.log(err);
    if (err.code == 11000) {
      SetResponse(rcResponse, 400, RequestErrorMsg('EmailExists', req, null), false);
      httpStatus = 400;
    } else {
      SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
      httpStatus = 500;
    }
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Update password details */
module.exports.userPasswordUpdate = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  try {
    const userData = await userModel.findOne({ _id: req.params.userId }).lean().exec();
    if (userData) {
      const passHash = await utils.generatePasswordHash(req.body.password);
      let userObj = {
        password: passHash,
      };
      // userObj = JSON.parse(JSON.stringify(userObj));
      const updateUser = await userModel.findOneAndUpdate({ _id: req.params.userId }, { $set: userObj }, { new: true }).lean().exec();
      delete updateUser.password;
      rcResponse.data = updateUser;
      rcResponse.message = 'User password has been updated successfully';
    } else {
      SetResponse(rcResponse, 400, RequestErrorMsg('userNotFound', req, null), false);
      httpStatus = 400;
    }
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};