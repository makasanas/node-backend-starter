/*
FileName : userModel.js
Date : 2nd Aug 2018
Description : This file consist of model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: Number, default: 2 },
  createdAt: { type: Date, default: Date.now() },
  deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Users', userSchema);