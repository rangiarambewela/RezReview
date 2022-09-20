const Review = require('../models/review')
const Listing = require('../models/listing');

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const { rating, body } = req.body.review;
    const review = new Review({ rating, body });
    review.author = req.user._id;
    const listing = await Listing.findById(id);
    listing.reviews.push(review)
    await review.save();
    await listing.save();
    req.flash('success', "Review Saved!")
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', "Review deleted successfully!")
    res.redirect(`/listings/${id}`);
}