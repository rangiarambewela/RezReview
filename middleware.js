const Listing = require('./models/listing');
const ExpressError = require('./utils/ExpressError')
const { listingSchema, reviewSchema } = require('./schemas.js');
const Review = require('./models/review');

module.exports.validateListing = (req, res, next) => {
    // console.log(req.body);
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login');
    }
    next();
}

module.exports.isListingAuthor = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that.');
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    // console.log(req.body);
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to delete this review.')
        return res.redirect(`/listings/${id}`);
    }
    next();
}

