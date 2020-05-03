/*
FileName : restaurantCtr.js
Date : 2nd Aug 2018
Description : This file consist of functions related to restaurants
*/

/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const restaurantsModel = require('./../models/restaurantsModel');
const commentsModel = require('./../models/commentsModel');
const reviewsModel = require('./../models/reviewsModel');
const usersModel = require('./../models/usersModel');
const mongoose = require('mongoose');

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/* Create new restaurant */
module.exports.createNewRestaurant = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  const { decoded } = req;

  if (!req.body.name || !req.body.location || !req.body.type || !req.body.description) {
    SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
    httpStatus = 400;
  }

  try {
    let restaurantObj = {
      name: req.body.name,
      location: req.body.location,
      type: req.body.type,
      description: req.body.description,
      ownerId: decoded.userId,
      imageFile: req.body.imageFile
    };
    restaurantObj = JSON.parse(JSON.stringify(restaurantObj));

    const restaurant = new restaurantsModel(restaurantObj);
    const restaurantSave = await restaurant.save();
    rcResponse.data = restaurantSave;
  } catch (err) {
    if (err.code === 11000) {
      SetResponse(rcResponse, 400, RequestErrorMsg('RestaurantExists', req, null), false);
      httpStatus = 400;
    } else {
      SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
      httpStatus = 500;
    }
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Get list of restaurants for the owner */
module.exports.getListOfRestaurantsOwned = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  const { decoded } = req;

  try {
    let restaurantList = await restaurantsModel.aggregate([
      {
        $match: {
          ownerId: mongoose.Types.ObjectId(decoded.userId),
          deleted: false
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'restaurantId',
          as: 'commentsObj'
        }
      },
      {
        $project: {
          "_id": 1,
          "createdAt": 1,
          "deleted": 1,
          "type": 1,
          "description": 1,
          "imageFile": 1,
          "name": 1,
          "location": 1,
          "ownerId": 1,
          "commentsObj": {
            $filter: {
              input: "$commentsObj",
              as: "comment_field",
              cond: {
                $and: [
                  { $eq: ["$$comment_field.deleted", false] },
                  { $eq: ["$$comment_field.reply", null] }
                ]
              }
            }
          },
          "comments": {
            $filter: {
              input: "$commentsObj",
              as: "comment_field",
              cond: {
                $and: [
                  { $eq: ["$$comment_field.deleted", false] },
                ]
              }
            }
          }
        }
      }
    ]).exec();
    await asyncForEach(restaurantList, async (rest) => {
      await asyncForEach(rest.commentsObj, async (elem) => {
        const getUserInfo = await usersModel.findOne({ _id: elem.userId }, { name: 1 }).lean().exec();
        elem.userObj = getUserInfo;
      });
    });

    rcResponse.data = restaurantList;
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Get details of the restaurant */
module.exports.getRestaurantDetails = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  try {
    let restaurantInfo = await restaurantsModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.restaurantId)
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "restaurantId",
          as: "commentsObj"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          location: 1,
          ownerId: 1,
          createdAt: 1,
          type: 1,
          description: 1,
          imageFile: 1,
          commentsObj: {
            $filter: {
              input: "$commentsObj",
              as: "comment_field",
              cond: {
                $eq: ["$$comment_field.deleted", false]
              }
            }
          },
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

    restaurantInfo = restaurantInfo[0];
    await asyncForEach(restaurantInfo.commentsObj, async (elem) => {
      const getUserInfo = await usersModel.findOne({ _id: elem.userId }, { name: 1 }).lean().exec();
      elem.userObj = getUserInfo;
    });

    rcResponse.data = restaurantInfo;
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Update restaurant details */
module.exports.updateRestaurantDetails = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  try {
    let restaurantObj = {
      name: req.body.name,
      location: req.body.location,
      type: req.body.type,
      description: req.body.description,
      imageFile: req.body.imageFile
    };
    restaurantObj = JSON.parse(JSON.stringify(restaurantObj));
    const updateRestaurant = await restaurantsModel.findOneAndUpdate({ _id: req.params.restaurantId }, { $set: restaurantObj }, { new: true }).lean().exec();
    rcResponse.data = updateRestaurant;
    rcResponse.message = 'Restaurant details has been updated successfully';
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Delete a restaurant */
module.exports.deleteRestaurant = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  try {
    const deleteRestaurant = await restaurantsModel.update({ _id: req.params.restaurantId }, { $set: { deleted: true } }).lean().exec();
    if (deleteRestaurant.nModified) {
      rcResponse.message = 'Restaurant has been deleted successfully';
    } else {
      httpStatus = 400;
      rcResponse.message = 'No restaurant found with this id';
    }
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};
