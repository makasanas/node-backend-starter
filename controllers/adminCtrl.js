/*
FileName : adminCtr.js
Date : 2nd Aug 2018
Description : This file consist of functions related to admin users
*/

/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse, UserRoles } = require('./../helpers/common');
const usersModel = require('./../models/usersModel');
const restaurantsModel = require('./../models/restaurantsModel');
const commentsModel = require('./../models/commentsModel');
const mongoose = require('mongoose');

/* Get all user list */
module.exports.usersList = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  try {
    const roles = new UserRoles();
    const userList = await usersModel.find({ role: roles.user, deleted: false }, { deleted: 0, password: 0 }).lean().exec();
    rcResponse.data = userList;
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Get all admin list */
module.exports.adminsList = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  try {
    const roles = new UserRoles();
    const userList = await usersModel.find({ role: roles.admin, deleted: false }, { deleted: 0, password: 0 }).lean().exec();
    rcResponse.data = userList;
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Get all owner list */
module.exports.ownersList = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  try {
    const roles = new UserRoles();
    const userList = await usersModel.find({ role: roles.owner, deleted: false }, { deleted: 0, password: 0 }).lean().exec();
    rcResponse.data = userList;
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Delete user */
module.exports.deleteUsers = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  try {
    const deleteUser = await usersModel.remove({ _id: req.params.userId }).lean().exec();
    if (deleteUser.n) {
      rcResponse.message = "User has been deleted successfully";
    } else {
      httpStatus = 400;
      rcResponse.message = "No user found with this id";
    }
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* List of restaurants */
module.exports.restaurantList = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  // Need to join in comment for rating average, total rating
  try {
    // const restaurantList = await restaurantsModel.find({ deleted: false }, { deleted: 0 }).lean().exec();


    const restaurantList = await restaurantsModel.aggregate([
      {
        $match: {
          deleted: false
        },
      }, {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "restaurantId",
          as: "commentsObj"
        }
      }, {
        $project: {
          _id: 1,
          name: 1,
          location: 1,
          ownerId: 1,
          createdAt: 1,
          type: 1,
          description: 1,
          imageFile: 1,
          totalReview: {
            '$size': {
              $filter: {
                input: "$commentsObj",
                as: "comment_field",
                cond: {
                  $eq: ["$$comment_field.deleted", false]
                }
              }
            }
          },
          average: {
            '$avg': {
              '$map': {
                'input': {
                  '$filter': {
                    input: "$commentsObj",
                    as: "comment_field",
                    cond: {
                      $eq: ["$$comment_field.deleted", false]
                    }
                  }
                },
                'as': 'grade',
                'in': '$$grade.rating'
              }
            }
          }
        }
      },
    ]).exec();

    rcResponse.data = restaurantList;
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

module.exports.deleteRestaurant = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  try {
    const deleteRestaurant = await restaurantsModel.remove({ _id: req.params.restaurantId }).lean().exec();
    if (deleteRestaurant.n) {
      rcResponse.message = "Restaurant has been deleted successfully";
    } else {
      httpStatus = 400;
      rcResponse.message = "No Restaurant found with this id";
    }
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};



module.exports.userDetails = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  try {
    const roles = new UserRoles();
    const [userInfo, userComments] = await Promise.all([
      usersModel.findOne({ _id: req.params.userId }, { password: 0 }),
      commentsModel.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(req.params.userId),
            deleted: false
          }
        },
        {
          $lookup: {
            from: 'restaurants',
            localField: 'restaurantId',
            foreignField: '_id',
            as: 'resObj'
          }
        },
        {
          $unwind: '$resObj'
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            comment: 1,
            rating: 1,
            createdAt: 1,
            reply: 1,
            'resObj._id': 1,
            'resObj.name': 1,
            'resObj.location': 1,
            'resObj.imageFile': 1
          }
        }
      ]).exec()
    ])
    if (userInfo) {
      rcResponse.data = { info: userInfo, comments: userComments };
    } else {
      SetResponse(rcResponse, 401, RequestErrorMsg('userNotFound', req, null), false);
      httpStatus = 401;
      return res.status(httpStatus).send(rcResponse);
    }
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};