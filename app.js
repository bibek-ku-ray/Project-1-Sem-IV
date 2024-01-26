const express = require('express');
const mongoose = require('mongoose');
const path = require("path");
const { log } = require('console');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
const ExpressError = require("./utils/ExpressError.js");
const listings = require('./routes/listing.js')
const reviews = require('./routes/review.js')

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

app.use('/listings', listings)
app.use('/listings/:id/reviews', reviews)

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