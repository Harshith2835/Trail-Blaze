const express=require('express')
const router=express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const {isLoggedIn,validateCampground,validateReview,isreviewAuth}=require('../middleware')
const Campground = require('../models/campground');
const mongoose = require('mongoose');
const reviewController=require('../controllers/reviewController');



router.post('/', isLoggedIn,validateReview,reviewController.CreateReview )
router.delete('/:reviewid',isLoggedIn,reviewController.DeleteReview)

module.exports=router;