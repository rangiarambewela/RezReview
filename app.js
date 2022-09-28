if (process.env.NODE_ENV !== "production") { // this code allows us to have access to environment variables for cloundinary database secrets/keys
    require('dotenv').config(); // runs if we are in development mode (i.e. not production mode)
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo')(session);


const ExpressError = require('./utils/ExpressError')
const listingRoutes = require('./routes/listings');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')
const User = require('./models/user');

const secret = process.env.SECRET || 'thisshouldbeabettersecret';
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-housing';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
// Code below checks if mongoose connection to database occurred successfully 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 60 * 60 * 24
})
store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://code.jquery.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/deqap2btv/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/deqap2btv/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/deqap2btv/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/deqap2btv/" ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/deqap2btv/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/deqap2btv/" ],
            childSrc   : [ "blob:" ]
        }
    })
);

app.use(passport.initialize());
app.use(passport.session()); // to ensure you have persistent session - i.e. don't want to have to log in every time send a new request
passport.use(new LocalStrategy(User.authenticate())); // asking passport to use passport-local for autheticating - using the authenticate method on the User model (method included when used passport-local-mongoose)
// two methods below tell passport how to store the use in the session
passport.serializeUser(User.serializeUser()); // how to store user in the passport session
passport.deserializeUser(User.deserializeUser()); // how to 'unstore' user in the passport session



app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes)
app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', reviewRoutes)

app.get('/', (req, res)=> {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError("Page not found!", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = "Oh no, something went wrong."
    }
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
    console.log("app served")
})