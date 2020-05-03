/*
FileName : fileHandler.js
Date : 2nd Aug 2018
Description : This file consist of files related functions
*/

/* DEPENDENCIES */
const multer = require('multer');
const path = require('path');
const appDir = path.dirname(require.main.filename);
const fs = require('fs');
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, appDir + '/../public/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '_' + file.originalname);
  }
});
const upload = multer({ storage: storage }).fields([
  { name: 'file', maxCount: 1 }
]);

module.exports.uploadObj = upload;

module.exports.uploadMedia = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;

  if (!req.files || !req.files.file) {
    SetResponse(rcResponse, 400, RequestErrorMsg('NoImage', req, null), false);
    httpStatus = 400;
    return res.status(httpStatus).send(rcResponse);
  }
  rcResponse.message = 'Media file has been successfullly uploaded';
  rcResponse.data = { fileName: req.files.file[0].filename }
  return res.status(httpStatus).send(rcResponse);
};