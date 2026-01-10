const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const sanitize = require('mongo-sanitize');
const LocalStrategy = require('passport-local').Strategy;

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
	passport.use(
		new LocalStrategy({ usernameField: 'username' },
			(username, password, done) => {
			// Match User
			User.findOne({ username: sanitize(username.toLowerCase()) })
			.then(user => {
				if(!user) {
					return done(null, false, { message: 'That username is not registered' });
				}

				// Match Password
				bcrypt.compare(password, user.password, (err, isMatch) => {
					if(err) throw err;

					if(isMatch) {
						if (!user.is_verified) {
							return done(null, false, { message: 'Your email has not been verified' });
						} else {
							return done(null, user);
						}
					} else {
						return done(null, false, { message: 'Password is incorrect' })
					}
				});
			}).catch(err => console.log(err));
		})
	);

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(id)
			.then(user => done(null, user))
			.catch(err => done(err, null));
	});
};
