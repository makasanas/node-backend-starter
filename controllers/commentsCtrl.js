/*
FileName : commentsCtr.js
Date : 2nd Aug 2018
Description : This file consist of functions related to restaurant comments
*/

/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const commentsModel = require('./../models/commentsModel');
const mongoose = require('mongoose');

/* Comment on restaurant */
module.exports.addNewComment = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  if (!req.body.userId || !req.body.rating || !req.body.comment || !req.body.restaurantId) {
    SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
    httpStatus = 400;
  }

  try {
    const commentObj = {
      restaurantId: req.body.restaurantId,
      userId: req.body.userId,
      comment: req.body.comment,
      rating: req.body.rating,
      createdAt: req.body.createdAt
    };
    const comment = new commentsModel(commentObj);
    const saveComment = await comment.save();
    rcResponse.data = saveComment;
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* List of comments by restaurant */
module.exports.listOfComments = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  try {
    const commentList = await commentsModel.aggregate([
      {
        $match: {
          restaurantId: mongoose.Types.ObjectId(req.params.restaurantId),
          deleted: false
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userObj'
        }
      },
      {
        $unwind: '$userObj'
      },
      {
        $project: {
          restaurantId: 1,
          comment: 1,
          createdAt: 1,
          'userObj._id': 1,
          'userObj.name': 1
        }
      }
    ]).exec();
    rcResponse.data = commentList;
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Update comments */
module.exports.updateComment = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  try {
    let commentObj = {
      reply: req.body.reply,
      comment: req.body.comment,
      rating: req.body.rating
    };
    commentObj = JSON.parse(JSON.stringify(commentObj));
    const updatecomment = await commentsModel.findOneAndUpdate({ _id: req.params.commentId }, { $set: commentObj }, { new: true }).lean().exec();
    rcResponse.data = updatecomment;
    rcResponse.message = 'Comment details has been updated successfully';
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Delete comment by amdin */
module.exports.deleteComment = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  try {
    const deleteComment = await commentsModel.update({ _id: req.params.commentId }, { $set: { deleted: true } }).lean().exec();
    if (deleteComment.nModified) {
      rcResponse.message = 'Comment has been deleted successfully';
    } else {
      httpStatus = 400;
      rcResponse.message = 'No Comment found with this id';
    }
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};