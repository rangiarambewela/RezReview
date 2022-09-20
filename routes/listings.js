const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { validateListing, isLoggedIn, isListingAuthor } = require('../middleware');
const listings = require('../controllers/listings')
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage });




router.route('/')
    .get(catchAsync(listings.getListings))
    .post(isLoggedIn, upload.array('image'), validateListing, catchAsync(listings.createListing));

router.get('/new', isLoggedIn, listings.renderNewListingForm);

router.route('/:id')
    .get(catchAsync(listings.showListing))
    .put(isLoggedIn, isListingAuthor, upload.array('image'), validateListing, catchAsync(listings.updateListing))
    .delete(isLoggedIn, isListingAuthor, catchAsync(listings.deleteListing));

router.get('/:id/edit', isLoggedIn, isListingAuthor, catchAsync(listings.renderEditListingForm));



module.exports = router;