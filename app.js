const express = require('express');
const path = require('path');
const method_override = require('method-override');
const ejsmate = require('ejs-mate');
const joi=require('joi');
const {campgroundSchema}=require('./validationschema')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const app = express();

app.engine('ejs', ejsmate);

app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')));

app.use(method_override('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
var mongoose = require('mongoose');
const campground = require('./models/campground');
const { title } = require('process');
var mongoDB = 'mongodb://127.0.0.1/TrailBlaze';
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const validateCampground=function(req,res,next){
    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/new', catchAsync(async (req, res) => {
    res.render('campgrounds/new')
}))

app.post('/campgrounds',validateCampground, catchAsync(async (req, res, next) => {
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const campground = await Campground.findById(id)
    res.render('campgrounds/show', { campground })
}))


app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id',validateCampground, catchAsync(async (req, res,next) => {
    const id = req.params.id;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${camp._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`)
}))

app.all('*', (req, res) => {
    next(new ExpressError('Page not found', 404))
})
app.use((err, req, res, next) => {
    const { statuscode = 500} = err
    if(!err.message) err.message="oh fuck something is pishy"
    res.status(statuscode).render('error',{err});
})

app.listen(3000, function () {
    console.log('Server is listening on port 3000')
})

