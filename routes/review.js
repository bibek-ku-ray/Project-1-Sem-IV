const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema} = require("../schema.js")
const Review = require("../models/review.js")
const Listing = require('../models/listing');

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body)
    // console.log(listingSchema.validate(req.body))
    if (error){
        let errMsg = error.details.map((errList) => errList.message).join(",");
        throw new ExpressError(400, errMsg)
    } else {
        next();
    }
}

// Review post
router.post('/',validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review)

    listing.reviews.push(newReview);
    req.flash("success", "New Review Created!")
    await newReview.save()
    await listing.save()

    // console.log("new review saved");
    // res.send("new review saved")

    res.redirect(`/listings/${listing._id}`)
}))

// review delete 
router.delete('/:reviewId', wrapAsync(async(req, res) => {
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "Review Deleted!")
    res.redirect(`/listings/${id}`)

}))

module.exports = router;