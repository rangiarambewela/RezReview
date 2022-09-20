const mongoose = require('mongoose');
const Listing = require('../models/listing');
const cities = require('./cities');
const { streetNames, streetTypes } = require('./streetNames');

mongoose.connect('mongodb://localhost:27017/yelp-housing', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
// Code below checks if mongoose connection to database occurred successfully 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

const randomStreet = arr => arr[Math.floor(Math.random() * arr.length)];

const seedDataBase = async () => {
    await Listing.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const price = Math.floor(Math.random() * 700) + 500;
        const randomStreetNum = Math.floor(Math.random() * 800);
        const randomCity = Math.floor(Math.random() * 1000); // bc array of cities has 1000 cities
        const newListing = new Listing({
            author: '61e486ab7e4b5270049c4fd3',
            streetNumber: randomStreetNum,
            streetName: `${randomStreet(streetNames)} ${randomStreet(streetTypes)}`,
            city: `${cities[randomCity].city}`,
            province: `${cities[randomCity].state}`,
            price: price,
            description: "lorPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.em",
            images: [{
                url: 'https://res.cloudinary.com/deqap2btv/image/upload/v1642640304/YelpHousing/fzzsrkbuwvpdoz7mtwjv.jpg',
                filename: 'YelpHousing/fzzsrkbuwvpdoz7mtwjv'
            }],
            geometry: { 
                type : "Point", 
                coordinates : [ 
                    cities[randomCity].longitude,
                    cities[randomCity].latitude
                ] }
        })
        await newListing.save()

    }
}

seedDataBase()
    .then(() => {
        db.close();
    })
    .catch(e => console.log(e))