const express = require('express');
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require("path");
const { log } = require('console');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js")
const Review = require("./models/review.js")

const app = express();

const MONGO_URL = "mongodb://127.0.0.1:27017/triptide";

main()
    .then(()=>{
        console.log("Connected to DB");
    })
    .catch((err)=>{
        console.log("Not Connected to DB: ", err);
    })


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
async function main(){
    await mongoose.connect(MONGO_URL)
}

app.get('/', function(req, res){
    res.send("Hello bibek")
});

// app.get('/testListing', async function(req, res){
//     let sampleListing = new Listing({
//         title: "Kathmandu Villa",
//         description: "7 Star villa on hills",
//         price: 55000,
//         location: "Kathmandu",
//         country: "Nepal"
//     })

//     await sampleListing.save()
//     console.log("Sample listed");
//     res.send("Sucessfully listed.")
// })

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body)
    // console.log(listingSchema.validate(req.body))
    if (error){
        let errMsg = error.details.map((errList) => errList.message).join(",");
        throw new ExpressError(400, errMsg)
    } else {
        next();
    }
}

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

// index route
app.get('/listings', wrapAsync(async (req, res)=>{
    const allListing = await Listing.find({})
    res.render("./listing/index.ejs", {allListing})
}))

//new route
app.get('/listings/new', wrapAsync(async(req, res)=>{
    res.render("./listing/new.ejs");
}))

//show route
app.get('/listings/:id', wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("./listing/show.ejs", {listing});

}))

//create route
app.post('/listings', validateListing, wrapAsync(async(req, res, next) => {

    // const result = listingSchema.validate(req.body);
    // console.log(result);

    const newListing = new Listing(req.body.listing);
  
    await newListing.save();
    res.redirect("/listings");
    
})
);

//edit route
app.get("/listings/:id/edit", wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    console.log(listing);
    res.render('./listing/edit.ejs', {listing});
}))

//update route
app.put('/listings/:id', validateListing, wrapAsync(async(req, res)=>{

    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing})
    res.redirect(`/listings/${id}`)

}))

//delete route
app.delete('/listings/:id', wrapAsync(async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect('/listings')
}))

// Review
app.post('/listings/:id/reviews',validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review)

    listing.reviews.push(newReview);

    await newReview.save()
    await listing.save()

    // console.log("new review saved");
    // res.send("new review saved")

    res.redirect(`/listings/${listing._id}`)
}))



app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page Not Found!"))
})

app.use((err, req, res, next)=>{
    let {statusCode=500, message="something went wrong!!"} = err;
    // res.status(statusCode).send(message)
    res.status(statusCode).render("./error.ejs", {message})
    
})

app.listen(8080, function(){
    console.log("server is running on 8080 port.");
})

