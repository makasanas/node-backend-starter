/*
FileName : dbConnection.js
Date : 2nd Aug 2018
Description : This file consist of code for MongoDB connection
*/

var mongoose = require('mongoose');

console.log(process.env['MONGO_URL']);
// database connection
mongoose.connect(process.env['MONGO_URL'], { useNewUrlParser: true, poolSize: 10, auto_reconnect: true });

// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + process.env['MONGO_URL']);
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err);
  mongoose.disconnect();
});
