if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}


const express = require('express');
const mongoose = require('mongoose');
const path = require("path");
const { log } = require('console');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require('./routes/listing.js')
const reviewRouter = require('./routes/review.js')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user.js')
const userRouter = require('./routes/user.js')

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


const sessionOption = {
    secret: "bibeksupersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.get('/', function(req, res){
    res.send("Hey Bibek")
});

app.use(session(sessionOption))
app.use(flash())

//auth
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user;
    next()
})

// app.get('/demouser', async(req, res) => {
//     let fakeUser = new User({
//         email: "demo@demo.com",
//         username: "demo1"
//     })
//     let registeredUser = await User.register(fakeUser, "demosalt")
//     res.send(registeredUser)
// })



app.use('/listings', listingRouter)
app.use('/listings/:id/reviews', reviewRouter)
app.use('/', userRouter)

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