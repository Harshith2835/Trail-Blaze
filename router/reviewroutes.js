const express=require('express')
const router=express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campground');
const mongoose = require('mongoose');
const { reviewvalidationSchema } = require('../validationschema');



const validateReview = function (req, res, next) {
    const { error } = reviewvalidationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


router.post('/', validateReview, catchAsync(async (req, res, next) => {
    
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('Invalid Campground ID', 400);
    }
    const camp = await Campground.findById(id);
    if (!camp) {
        throw new ExpressError('Campground not found', 404);
    }
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success','Review uploaded');
    res.redirect(`/campgrounds/${camp._id}`);
}))
router.delete('/:reviewid',catchAsync(async(req,res,next)=>{
    const {id,reviewid}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewid}})
    await Review.findByIdAndDelete(reviewid);
    req.flash('success','Successfully deleted the review');
    res.redirect(`/campgrounds/${id}`)
}))

module.exports=router;