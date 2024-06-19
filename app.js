const express = require('express');
const path = require('path');
const method_override = require('method-override');
const ejsmate = require('ejs-mate');
const joi = require('joi');
const Review = require('./models/review');
const { campgroundSchema, reviewvalidationSchema } = require('./validationschema');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const mongoose = require('mongoose');
const app = express();

app.engine('ejs', ejsmate);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(method_override('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const mongoDB = 'mongodb://127.0.0.1/TrailBlaze';
mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const validateReview = function (req, res, next) {
    const { error } = reviewvalidationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateCampground = function (req, res, next) {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}));

app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('Invalid Campground ID', 400);
    }
    const campground = await Campground.findById(id).populate('reviews');
    if (!campground) {
        throw new ExpressError('Campground not found', 404);
    }
    res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
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

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('Invalid Campground ID', 400);
    }
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${camp._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('Invalid Campground ID', 400);
    }
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
}));

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res, next) => {
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
    res.redirect(`/campgrounds/${camp._id}`);
}))
app.delete('/campgrounds/:id/reviews/:reviewid',catchAsync(async(req,res,next)=>{
    const {id,reviewid}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewid}})
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/campgrounds/${id}`)
}))
app.use((err, req, res, next) => {
    const { statuscode = 500 } = err;
    if (!err.message) err.message = "Oh no, something went wrong!";
    res.status(statuscode).render('error', { err });
});
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
});


app.listen(3000, function () {
    console.log('Server is listening on port 3000');
});

