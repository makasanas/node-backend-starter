/*
FileName : reviewsModel.js
Date : 2nd Aug 2018
Description : This file consist of model fields
*/
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var reviewsSchema = new Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurants' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  rating: { type: Number, required: true },
  comment: { type: Array, default: [] },
  dateOfVisit: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now() },
  deleted: { type: Boolean, default: false }
});

reviewsSchema.index({ restaurantId: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model('Reviews', reviewsSchema);