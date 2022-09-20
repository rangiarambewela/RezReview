const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    rating: Number,
    body: String,
})

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;