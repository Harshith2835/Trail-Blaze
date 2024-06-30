const joi=require('joi')
module.exports.campgroundSchema=joi.object({
    campground:joi.object({
        title:joi.string().required(),
        price:joi.number().min(0).required(),
        // image:joi.string().required(),
        location:joi.string().required(),
        description:joi.string().required(),
    }).required(),
    deleteImages:joi.array()
})
module.exports.reviewvalidationSchema=joi.object({
    review:joi.object({
        body:joi.string().required(),
        rating:joi.number().required().min(1).max(5)
    }).required()
})