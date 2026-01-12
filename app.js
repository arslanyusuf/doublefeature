const cors = require('cors');
const path = require('path');
const chalk = require("chalk");
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const filter = require('content-filter');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const expressLayouts = require('express-ejs-layouts');

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
const morganMiddleware = morgan((tokens, req, res) => {
    if (req.method === "OPTIONS" || (req.path.includes("eco-freight") && res.statusCode === 429)) {
        return null;
    }

    const statusCode = tokens.status(req, res);
    const statusColor = (statusCode >= 200 && statusCode < 300) || statusCode == 304 ? chalk.green.bold : chalk.red.bold;

    return [
        chalk.magenta.bold(req.ip),
        chalk.gray("- -"),
        chalk.cyan(`[${new Date().toUTCString()}]`),
        chalk.white(`"${tokens.method(req, res)} ${tokens.url(req, res)} ${req.protocol.toUpperCase()}/${req.httpVersion}"`),
        statusColor(statusCode),
        chalk.magenta(`[Size: ${req.headers["content-length"] || 0}]`),
        chalk.yellow(tokens["response-time"](req, res) + " ms")
    ].join(" ");
});

app.use(morganMiddleware);

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
