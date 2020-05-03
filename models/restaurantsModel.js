/*
FileName : restaurantsModel.js
Date : 2nd Aug 2018
Description : This file consist of model fields
*/
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var restaurantsSchema = new Schema({
  name: { type: String, unique: true, required: true },
  location: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  createdAt: { type: Date, default: Date.now() },
  deleted: { type: Boolean, default: false },
  type: { type: String, default: null },
  description: { type: String, default: null },
  imageFile: { type: String, default: null }
});

module.exports = mongoose.model('Restaurants', restaurantsSchema);