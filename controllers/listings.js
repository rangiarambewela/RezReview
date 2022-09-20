const { cloudinary } = require('../cloudinary');
const Listing = require('../models/listing');
const mbxGeocoding= require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken})
module.exports.getListings = async (req, res, next) => {
    const allListings = await Listing.find({});
    res.render('listings/index', { allListings });
}

module.exports.renderNewListingForm = (req, res) => {
    res.render('listings/new')
}

module.exports.createListing = async (req, res, next) => {
    const queryLocation = `${req.body.listing.city}, ${req.body.listing.province}`;
    const geoData = await geocoder.forwardGeocode({
        query: queryLocation,
        limit: 1
    }).send()
    const { streetNumber, streetName, city, province, image, price, description } = req.body.listing
    const newListing = new Listing({
        streetNumber: streetNumber,
        streetName: streetName,
        city: `${city}`,
        province: `${province}`,
        image: image,
        price: price,
        description: description
    })
    newListing.geometry = geoData.body.features[0].geometry;
    newListing.images = req.files.map(f => ({ // makes an array of objects --> each object corresponds to a file and contains the file path to the image in cloudinary and the file name
        url: f.path,
        filename: f.filename
    }))
    newListing.author = req.user._id;
    await newListing.save();
    req.flash('success', 'Successfully created new listing!')
    res.redirect(`/listings/${newListing._id}`)
}

module.exports.showListing = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!listing) {
        req.flash('error', 'Listing does not exist.')
        return res.redirect('/listings')
    }
    res.render('listings/show', { listing });
}

module.exports.renderEditListingForm = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing does not exist.')
        return res.redirect('/listings')
    }
    res.render('listings/edit', { listing });
}

module.exports.updateListing = async (req, res, next) => {
    // res.send("Edit sent!")
    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    listing.images.push(...images);
    await listing.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await listing.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully saved listing!')
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteListing = async (req, res, next) => {
    // res.send("Got to delete Page!")
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    // console.log(listing);
    req.flash('success', 'Successfully deleted listing!')
    res.redirect('/listings');
}