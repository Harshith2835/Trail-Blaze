const passport=require('passport')

module.exports.isLoggedIn=function(req,res,next){
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','please login before you add a camp');
        return res.redirect('/login')
    }
    next();
}
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}