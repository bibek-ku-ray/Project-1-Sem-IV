const express = require('express');
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require("path");
const { log } = require('console');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")

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

//index route
app.get('/listings', async (req, res)=>{
    const allListing = await Listing.find({})
    res.render("./listing/index.ejs", {allListing})
})

//new route
app.get('/listings/new', async(req, res)=>{
    res.render("./listing/new.ejs");
})

//show route
app.get('/listings/:id', async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listing/show.ejs", {listing});

})

//create route
app.post('/listings', async(req, res)=>{
    let listing = req.body.listing;
    const newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
})

//edit route
app.get("/listings/:id/edit", async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    console.log(listing);
    res.render('./listing/edit.ejs', {listing});
})

//update route
app.put('/listings/:id', async(req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing})
    res.redirect(`/listings/${id}`)

})

//delete route
app.delete('/listings/:id', async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect('/listings')
})

app.listen(8080, function(){
    console.log("server is running on 8080 port.");
})

