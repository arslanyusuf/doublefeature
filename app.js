const cors = require('cors');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const filter = require('content-filter');
const nodemailer = require('nodemailer');
const session = require('express-session');
const sanitize = require('mongo-sanitize');
const MongoStore = require('connect-mongo')(session);
const expressLayouts = require('express-ejs-layouts');
const uniqueValidator = require('mongoose-unique-validator');

const app = express();

// Database Config
const connectDB = require('./config/db');

// Passport Config
require('./config/passport')(passport);

// Dotenv Config
require('dotenv').config();

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
connectDB();

// Logging
if(process.env.NODE_ENV == 'development') {
	app.use(morgan('dev'));
};

// Cross-Origin Resource Sharing
app.use(cors());

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout');

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session & Connect Mongo
app.use(session({
	secret: 'liyon arsy',
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({ mongooseConnection: mongoose.connection }),
	cookie: {
		maxAge: 1000*3600*24*7,
		sameSite: true
	}
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Content Filter
app.use(filter());

// Global Variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.success_create = req.flash('success_create');
	res.locals.fail_create = req.flash('fail_create');
	next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/about', require('./routes/about'));
app.use('/search', require('./routes/search'));
app.use('/movies', require('./routes/movies'));
app.use('/persons', require('./routes/persons'));
app.use('/features', require('./routes/features'));
app.use('/settings', require('./routes/settings'));
app.use(function(req, res) {
	res.status(404).render('404', {
		layout: 'layouts/infinity'
	})
});

const PORT = process.env.PORT || 5000;

app.listen(
	PORT,
	console.log('Server running in ' + process.env.NODE_ENV + ' mode on port ' + PORT + '...')
);

module.exports = app;
