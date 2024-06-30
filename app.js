if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./router/campgroundsroutes');
const userRoutes = require('./router/userroutes');
const reviewRoutes = require('./router/reviewroutes');
const flash=require('connect-flash');
const User=require('./models/user');
const passport = require('passport');
const localstrategy=require('passport-local')
// Database connection
const mongoDB = 'mongodb://127.0.0.1/TrailBlaze';
mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

// EJS-Mate setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Session configuration
const sessionConfig = {
    secret: 'ananthula35',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
app.use( passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(flash())
app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currentUser=req.user;
    next();
})


// Routes
app.get('/', (req, res) => {
    res.render('home');
});

app.use("/campgrounds", campgroundRoutes);
app.use("/", userRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// Error handling middleware

// Catch-all route for 404 errors
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!';
    res.status(statusCode).render('error', { err });
});
// Server setup
app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
