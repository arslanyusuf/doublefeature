const express = require('express');
const ObjectID = require('mongodb').ObjectID;

// Instance of Router
const router = express.Router();

// Models
const User = require('../models/User');
const Rating = require('../models/Rating');
const Comment = require('../models/Comment');
const DoubleFeature = require('../models/DoubleFeature');

const { ensureAuthenticated, forwardAuthenticated } = require('../config/forwardauth');

// @description     Settings page
// @route           GET /settings
router.get('/', ensureAuthenticated, (req, res) => {
	const user = req.user;
	res.render('settings', {
		'user': user
	});
});

// @description     Settings page - Delete Account Button
// @route           POST /settings
router.post('/', (req, res) => {
	DoubleFeature.deleteMany( { user: ObjectID(req.user.id) } )
	.then(result => {
		console.log(result);
	});
	Comment.deleteMany( { user: ObjectID(req.user.id) } )
	.then(result => {
		console.log(result);
	});
	Rating.find(
		{
			user: ObjectID(req.user.id)
		},
		function(error, rating) {
			if (error) {
				console.error(error);
			} else {
				console.log(rating);
				for (var i = 0; i < rating.length; i++) {
					DoubleFeature.findOneAndUpdate(
						{ _id: rating[i].doublefeature },
						{ $inc:
							{
								rating_value: -Math.abs(rating[i].rating)
							},

						}
					)
					.then(result => {
						console.log(result);
					});	
				}
			}
		}
	)
	.then(result => {
		console.log(result);
		Rating.deleteMany( { user: ObjectID(req.user.id) } )
		.then(result => {
			console.log(result);
		});
	});

	User.findOne(
		{
			_id: ObjectID(req.user.id)
		},
		function(error, user) {
			if (error) {
				console.error(error);
			} else {
				if (user.watched.length !== 0) {
					for (var i = 0; i < user.watched.length; i++) {
						DoubleFeature.findOneAndUpdate(
							{ _id: ObjectID(user.watched[i]) },
							{ $inc:
								{
									watch_count: -1
								}
							}
						)
						.then(result => {
							console.log(result);
						});
					}
				}

				if (user.liked !== 0) {
					for (var i = 0; i < user.liked.length; i++) {
						DoubleFeature.findOneAndUpdate(
							{ _id: ObjectID(user.liked[i]) },
							{ $inc:
								{
									like_count: -1
								}
							}
						)
						.then(result => {
							console.log(result);
						});
					}
				}

				if (user.rated !== 0) {
					for (var i = 0; i < user.rated.length; i++) {
						DoubleFeature.findOneAndUpdate(
							{ _id: ObjectID(user.rated[i]) },
							{ $inc:
								{
									rating_count: -1
								}
							}
						)
						.then(result => {
							console.log(result);
						});
					}
				}
			}
		}
	)
	.then(result => {
		console.log(result);
		User.deleteOne( { user: ObjectID(req.user.id) } )
		.then(result => {
			console.log(result);
		});
	});

	req.logout();
	req.session.destroy();
	res.redirect('/');
});

module.exports = router;
