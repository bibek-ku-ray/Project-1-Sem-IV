const mongoose = require('mongoose');
const initData = require('./data')
const Listing = require('../models/listing.js')

const MONGO_URL = "mongodb://127.0.0.1:27017/triptide";


main()
.then(()=>{
    console.log("Connected to DB in init");
})
.catch((err)=>{
    console.log("Not Connected to DB in init: ", err);
})

async function  main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
 
    try{
        initData.data = initData.data.map((obj) => ({...obj, owner: "65b764da4dac733760df1cd9"}))
        await Listing.insertMany(initData.data);
        console.log("data was initialized");
    } catch(err){ 
        console.log(err);
    }
};

initDB();