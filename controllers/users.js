const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}

module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Housing!');
            res.redirect('/listings');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }

}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    const originalUrl = req.session.returnTo || '/listings';
    delete req.session.returnTo;
    req.flash('success', 'Welcome back to Yelp Housing!')
    res.redirect(originalUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "Logged Out.")
    res.redirect('/listings');
}