const express=require('express')
const router=express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const User=require('../models/user');
const passport=require('passport');
const { storeReturnTo } = require('../middleware');

router.get('/register',async(req,res,next)=>{
    res.render('users/register')
})
router.post('/register',catchAsync(async(req,res,next)=>{
    try{
    const {email,username,password}=req.body.user;
    const newuser=new User({email,username})
    const registeredUser=await User.register(newuser,password);
    req.login(registeredUser, err=>{
        if(err) return next(err);
        req.flash('success','welcome to trailblaze');
        res.redirect('/campgrounds');
    })
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register')
    }
}));
router.get('/login',async(req,res,next)=>{
    res.render('users/login');
})
router.post('/login',storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),catchAsync(async(req,res,next)=>{
    req.flash('success',"Logged in Successfully");
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}));
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}); 
module.exports=router;