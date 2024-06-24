const express=require('express')
const router=express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema} = require('../validationschema');
const {isLoggedIn}=require('../middleware')
const mongoose = require('mongoose');


const validateCampground = function (req, res, next) {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res,next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

router.get('/new',isLoggedIn, (req, res,next) => {
    res.render('campgrounds/new');
});

router.post('/', isLoggedIn,validateCampground, catchAsync(async (req, res) => {
    const camp = new Campground(req.body.campground);
    await camp.save();
    req.flash('success',"Successfully created the camp")
    res.redirect(`/campgrounds/${camp._id}`);
}));

router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('Invalid Campground ID', 400);
    }
    const campground = await Campground.findById(id).populate('reviews');
    if (!campground) {
        req.flash('error',"Can't find the campground");
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('Invalid Campground ID', 400);
    }
    const campground = await Campground.findById(id);
    if (!campground) {
        throw new ExpressError('Campground not found', 404);
    }
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('Invalid Campground ID', 400);
    }
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success','Succesfully updated the camp')
    res.redirect(`/campgrounds/${camp._id}`);
}));

router.delete('/:id', isLoggedIn,catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('Invalid Campground ID', 400);
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted the camp');
    res.redirect(`/campgrounds`);
}));


module.exports=router;