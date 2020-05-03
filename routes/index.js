/*
FileName : Index.js
Date : 2nd Aug 2018
Description : This file consist of list of routes for the APIs
*/

/* DEPENDENCIES */
const express = require('express');
const router = express.Router();
const dbConnection = require('./../config/dbConnection');
const authCtrl = require('./../controllers/authCtrl');
const restaurantCtrl = require('./../controllers/restaurantCtrl');
const checkToken = require('./../middlewares/checkToken');
const fileHandler = require('./../helpers/fileHandler');
const commentsCtrl = require('./../controllers/commentsCtrl');
const adminCtrl = require('./../controllers/adminCtrl');


/*****************************
 USERS
 *****************************/

/* Authenticate User */
router.post('/user/login', authCtrl.login);

/* Register new User */
router.post('/user/register', authCtrl.register);

/* Get User profile information */
router.get('/user/profile', checkToken.validateToken, authCtrl.getUserProfile);

/* Put user by id */
router.put('/user/:userId', checkToken.validateToken, checkToken.isAdminUser, authCtrl.userUpdate);

/* user password update */
router.put('/user/updatepassword/:userId', checkToken.validateToken, checkToken.isAdminUser, authCtrl.userPasswordUpdate);



/*****************************
 RESTAURANTS
 *****************************/

/* Create a new restaurant */
router.post('/restaurants', checkToken.validateToken, checkToken.isOwner, restaurantCtrl.createNewRestaurant);

/* Upload restaurant image */
router.post('/restaurants/image', checkToken.validateToken, checkToken.isOwner, fileHandler.uploadObj, fileHandler.uploadMedia);

/* Get list of restaurants */
router.get('/restaurants', checkToken.validateToken, checkToken.isOwner, restaurantCtrl.getListOfRestaurantsOwned);

/* Get restaurant detail by id */
router.get('/restaurants/:restaurantId', checkToken.validateToken, restaurantCtrl.getRestaurantDetails);

/* Update restaurant details by id */
router.put('/restaurants/:restaurantId', checkToken.validateToken, checkToken.isOwnerOrAdmin, restaurantCtrl.updateRestaurantDetails);

/* Delete a restaurant */
router.delete('/restaurants/:restaurantId', checkToken.validateToken, checkToken.isOwnerOrAdmin, restaurantCtrl.deleteRestaurant);


/*****************************
 RESTAURANT COMMENTS
 *****************************/

/* Comment on restaurant */
router.post('/restaurants/comment', checkToken.validateToken, commentsCtrl.addNewComment);

/* List comment by restaurant id */
router.get('/restaurants/comment/:restaurantId', checkToken.validateToken, commentsCtrl.listOfComments);

/* Update comments */
router.put('/restaurants/comment/:commentId', checkToken.validateToken, checkToken.isOwnerOrAdmin, commentsCtrl.updateComment);

/* Delete comments */
router.delete('/comment/:commentId', checkToken.validateToken, checkToken.isOwnerOrAdmin, commentsCtrl.deleteComment);


/*****************************
 RESTAURANT REVIEWS
 *****************************/




/*****************************
 ADMIN
*****************************/

/* Get all normal user list */
router.get('/admin/users', checkToken.validateToken, checkToken.isAdminUser, adminCtrl.usersList);

/* Get user by id */
router.get('/admin/users/:userId', checkToken.validateToken, checkToken.isAdminUser, adminCtrl.userDetails);

/* Get all admin user list */
router.get('/admin/admins', checkToken.validateToken, checkToken.isAdminUser, adminCtrl.adminsList);

/* Get all owner user list */
router.get('/admin/owners', checkToken.validateToken, checkToken.isAdminUser, adminCtrl.ownersList);

/* Delete user by Id */
router.delete('/admin/users/delete/:userId', checkToken.validateToken, checkToken.isAdminUser, adminCtrl.deleteUsers);

/* List all restaurants */
router.get('/admin/restaurants', checkToken.validateToken, adminCtrl.restaurantList);

/* Delete restaurants */
router.delete('/admin/restaurants/delete/:restaurantId', checkToken.validateToken, checkToken.isAdminUser, adminCtrl.deleteRestaurant);


module.exports = router;