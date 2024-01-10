const mongoose = require('mongoose');
const initData = require('./data')
const Listing = require('../models/listing.js')

const MONGO_URL = "mongodb://127.0.0.1:27017/triptide";

async function  main(){
    await mongoose.connect(MONGO_URL);
}

main()
    .then(()=>{
        console.log("Connected to DB in init");
    })
    .catch((err)=>{
        console.log("Not Connected to DB in init: ", err);
    })


const intiDB = async () => {
    try {
        await Listing.deleteMany({})
    } catch (error) {
        console.log("Error while deleting in init.");
    }

    try {  
        await Listing.insertMany(initData.data)
    } catch (error) {
        console.log("Error while inserting the data in init");
    }
    console.log("all data initialized in init.");
};

intiDB();