const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require('../models/listing');
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js")



// index route
router.get('/', wrapAsync(async (req, res)=>{
    const allListing = await Listing.find({})
    res.render("./listing/index.ejs", {allListing})
}))

//new route
router.get('/new',isLoggedIn, wrapAsync(async(req, res)=>{

    res.render("./listing/new.ejs");
}))

//show route
router.get('/:id', wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author"
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing doesn't exits!")
        res.redirect('/listings')
    }
    console.log(listing)
    res.render("./listing/show.ejs", {listing});

}))

//create route
router.post('/' ,isLoggedIn, validateListing, wrapAsync(async(req, res, next) => {
    // const result = listingSchema.validate(req.body);
    // console.log(result);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!")
    res.redirect("/listings");
    
})
);

//edit route
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing doesn't exits!")
        res.redirect('/listings')
    }
    res.render('./listing/edit.ejs', {listing});
}))

//update route
router.put('/:id',
    isLoggedIn, 
    isOwner,
    validateListing, 
    wrapAsync(async(req, res)=>{

    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing})
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`)

}))

//delete route
router.delete('/:id',isLoggedIn,isOwner, wrapAsync(async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!")
    res.redirect('/listings')
}))

module.exports = router;