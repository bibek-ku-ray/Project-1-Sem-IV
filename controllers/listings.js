const Listing = require("../models/listing")

module.exports.index = async (req, res)=>{
    const allListing = await Listing.find({})
    res.render("./listing/index.ejs", {allListing})
}

module.exports.renderNewForm = async(req, res)=>{
    res.render("./listing/new.ejs");
}

module.exports.showListings = async(req, res)=>{
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

}


module.exports.createListing = async(req, res, next) => {
    // const result = listingSchema.validate(req.body);
    // console.log(result);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!")
    res.redirect("/listings");
    
}

module.exports.editForm = async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing doesn't exits!")
        res.redirect('/listings')
    }
    res.render('./listing/edit.ejs', {listing});
}

module.exports.updateListing = async(req, res)=>{

    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing})
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`)

}

module.exports.destroyListing = async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!")
    res.redirect('/listings')
}