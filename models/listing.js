const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')


const imageSchema = new Schema({
    url: String,
    filename: String,
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})


const opts = {toJSON: {virtuals: true}};
const ListingSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    streetNumber: Number,
    streetName: String,
    city: String,
    province: String,
    geometry: {
        type:{
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates:{
            type: [Number],
            required: true
        }
    },
    images: [imageSchema],
    price: Number,
    description: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]

}, opts)

ListingSchema.virtual('properties.popUpText').get(function () {
    return `<strong><a href="/listings/${this._id}">${this.streetNumber} ${this.streetName}</a></strong><p>${this.city}, ${this.province}</p>`;
})



ListingSchema.post('findOneAndDelete', async function (listing) {
    if (listing) {
        await Review.deleteMany({
            _id: {
                $in: listing.reviews
            }
        })
    }
})

const Listing = mongoose.model('Listing', ListingSchema);
module.exports = Listing;