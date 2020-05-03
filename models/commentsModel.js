/*
FileName : commentsModel.js
Date : 2nd Aug 2018
Description : This file consist of model fields
*/
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var commentsSchema = new Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurants' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  comment: { type: String, required: true },
  rating: { type: Number, required: true },
  reply: { type: String, default: null },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
  deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Comments', commentsSchema);