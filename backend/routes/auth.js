const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const express = require('express');
const passport = require('passport');
const nodemailer = require('nodemailer');
const sanitize = require('mongo-sanitize');

// Instance of Router
const router = express.Router();

// Models
const User = require('../models/User');
const Token = require('../models/Token');

// @description     Signin page
// @route           GET /auth/signin
router.get('/signin', (req, res) => {
	res.render('signin', {
		layout: 'layouts/authentication'
	});
});

// @description     Signup page
// @route           GET /auth/signup
router.get('/signup', (req, res) => {
	res.render('signup', {
		layout: 'layouts/authentication'
	});
});

// @description     Signup page - Signup Button
// @route           POST /auth/signup
router.post('/signup', (req, res) => {
	 const username = sanitize(req.body.username.toLowerCase());
	 const email = sanitize(req.body.email.toLowerCase());
	 const password = req.body.password;
	 const confpassword = req.body.confpassword;
	 let errors = [];

	 // Check required fields
	 if (!username || !email || !password || !confpassword) {
		 errors.push({ msg: 'Please fill in all fields' });
	 }

	 // Check username alphanumeric
	 if(!username.match(/^[a-zA-Z0-9\-\_]+$/)) {
		 errors.push({ msg: 'Username may only contain alphanumeric characters, dashes or underscore' });
	 }

	 // Check password match
	 if (password !== confpassword) {
		 errors.push({ msg: 'Passwords do not match' });
	 }

	 // Check password length
	 if (password.length < 6) {
		 errors.push({ msg: 'Password should be at least 6 characters' });
	 }

	 if (errors.length > 0) {
		 res.render('signup', {
			 layout: 'layouts/authentication',
			 errors,
			 username,
			 email,
			 password,
			 confpassword
		 });
	 } else {
		 // Validation passed
		 User.findOne({ email: email.toLowerCase() }).then(user => {
				if (user) {
					errors.push({ msg: 'This email is already registered' })
					res.render('signup', {
						layout: 'layouts/authentication',
						errors,
						username,
						email,
						password,
						confpassword
					});
				} else {
					User.findOne({ username: username.toLowerCase() }).then(user => {
						 if (user) {
							 errors.push({ msg: 'This username is already taken' })
							 res.render('signup', {
								 layout: 'layouts/authentication',
								 errors,
								 username,
								 email,
								 password,
								 confpassword
							 });
						 } else {
							 const newUser = new User({
								 username,
								 email,
								 password
							 });

							 // Hash password
							 bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
									if(err) throw err;
									// Set password to hashed
									newUser.password = hash;
									// Save user
									newUser.save()
									.then(user => {

										var token = new Token(
											{ 
												user: user._id,
												token: crypto.randomBytes(16).toString('hex')
											}
										);
										token.save(function (err) {
											if (err) {
												console.log(err);
											}
											
											async function main() {

												const htmlOutput = `
													<p>Hey ${username},</p>
													<p>Thanks for joining the Double Feature community.</p>
													<p>Please verify your email adddress by clicking the link:</p>
													<p>http://www.doublefeature.watch/auth/confirmation/${email}/${token.token}</p>
													<p>Thanks,<br>Double Feature</p>`;

											  	// create reusable transporter object using the default SMTP transport
											  	let transporter = nodemailer.createTransport({
											    	host: process.env.EMAIL_HOST,
											    	port: 587,
											    	secure: false, // true for 465, false for other ports
											    	auth: {
											      		user: process.env.EMAIL_USER,
											      		pass: process.env.EMAIL_PASS
											    	},
											    	tls: {
											    		rejectUnauthorized: false
											    	}
											  	});

											  	// send mail with defined transport object
											  	let info = await transporter.sendMail({
											    	from: '"Double Feature" <support@doublefeature.watch>', // sender address
											    	to: email, // list of receivers
											    	subject: "Welcome to Double Feature", // Subject line
											    	text: "Hey " + username + ",\n\n" + "Thanks for joining the Double Feature community.\n\n" + "Please verify your email address by clicking the link: \n\nhttp:\/\/www.doublefeature.watch/auth/confirmation\/" + email + "\/" + token.token + "\n\nThanks,\nDouble Feature",
											    	html: htmlOutput
											  	});

											  	console.log("Message sent: %s", info.messageId);
											  	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
											}
											main().catch(console.error);
										})

										req.flash('success_msg', 'A verification email has been sent to ' + email)
										res.redirect('/auth/confirmation/'+email);
									})
									.catch(err => console.log(err));
							 }))
						 }
					 }).catch(err => console.log(err));
				}
			}).catch(err => console.log(err));
	 }
});

// @description     Confirmation page - Confirms if email was verified
// @route           GET /auth/confirmation/email/token
router.get('/confirmation/:email/:token', (req, res) => {
	Token.findOne(
		{ 
			token: req.params.token
		},
		function (err, token) {
			if (!token) {
				req.flash('error_msg', 'Your verification email may have expired');
				res.render('confirmation', {
					layout: 'layouts/authentication'
				});
			} else {
				User.findOne(
					{
						_id: token.user,
						email: req.params.email
					},
					function(err, user) {
						if (!user) {
							req.flash('error_msg', 'A user was unable to be found for this verification');
							res.render('confirmation', {
								layout: 'layouts/authentication'
							});
						} else if (user.is_verified) {
							req.flash('error_msg', 'User has already been verified');
							res.render('confirmation', {
								layout: 'layouts/authentication'
							});
						} else {
							user.is_verified = true;
							user.save(function (err) {
								if (err) {
									req.flash('error_msg', 'Something went wrong');
									res.render('confirmation', {
										layout: 'layouts/authentication'
									});
								} else {
									req.flash('success_msg', 'Your account has been successfully verified');
									res.redirect('/auth/signin');
								}
							})
						}
					}
				)
			}
		}
	)
	.then(result => {
		console.log(result);
		Token.deleteOne( { token: req.params.token } )
		.then(result => {
			console.log(result);
		})
	})

});

// @description     Verification Page - Waiting page after verfication link has been sent
// @route           GET /auth/confirmation/:email
router.get('/confirmation/:email', (req, res) => {
	res.render('confirmation', {
		layout: 'layouts/authentication'
	});
});

// @description     Verification Page - Resend Email Verification Button
// @route           POST /auth/confirmation/email
router.post('/confirmation/:email', (req, res, next) => {
	User.findOne(
		{
			email: req.params.email
		},
		function(err, user) {
			if (!user) {
				req.flash('error_msg', 'User with that email does not exist');
				res.redirect('back');
			} else if (user.is_verified) {
				req.flash('success_msg', 'This account has already been verified');
				res.redirect('/auth/signin')
			} else {
				var token = new Token(
					{ 
						user: user._id,
						token: crypto.randomBytes(16).toString('hex')
					}
				);
				token.save(function (err) {
					if (err) {
						console.log(err);
					}

					async function main() {

						const htmlOutput = `
							<p>Hey ${user.username},</p>
							<p>Thanks for joining the Double Feature community.</p>
							<p>Please verify your email adddress by clicking the link:</p>
							<p>http://www.doublefeature.watch/auth/confirmation/${user.email}/${token.token}</p>
							<p>Thanks,<br>Double Feature</p>`;

					  	// create reusable transporter object using the default SMTP transport
					  	let transporter = nodemailer.createTransport({
					    	host: process.env.EMAIL_HOST,
					    	port: 587,
					    	secure: false, // true for 465, false for other ports
					    	auth: {
					      		user: process.env.EMAIL_USER,
					      		pass: process.env.EMAIL_PASS
					    	},
					    	tls: {
					    		rejectUnauthorized: false
					    	}
					  	});

					  	// send mail with defined transport object
					  	let info = await transporter.sendMail({
					    	from: '"Double Feature" <support@doublefeature.watch>', // sender address
					    	to: user.email, // list of receivers
					    	subject: "Welcome to Double Feature", // Subject line
					    	text: "Hey " + user.username + ",\n\n" + "Thanks for joining the Double Feature community.\n\n" + "Please verify your email address by clicking the link: \n\nhttp:\/\/www.doublefeature.watch/auth/confirmation\/" + user.email + "\/" + token.token + "\n\nThanks,\nDouble Feature",
					    	html: htmlOutput
					  	});

					  	console.log("Message sent: %s", info.messageId);
					  	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
					}
					main().catch(console.error);
				})

				req.flash('success_msg', 'A verification email has been sent to ' + req.params.email)
				res.redirect('back');
			}
		}
	)
});

// @description     Signin Page - Sign In Button
// @route           POST /auth/signin
router.post('/signin', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/users/' + req.body.username.toLowerCase(),
		failureRedirect: 'signin',
		failureFlash: true
	}) (req, res, next);
});

// @description     Signout Page
// @route           GET /auth/signout
router.get('/signout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'You have been signed out');
	res.redirect('back');
	req.session.destroy();
});

module.exports = router;
