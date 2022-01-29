const axios = require('axios');
const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const sanitize = require('mongo-sanitize');

// Instance of Router
const router = express.Router();

// Models
const User = require('../models/User');
const Rating = require('../models/Rating');
const Comment = require('../models/Comment');
const DoubleFeature = require('../models/DoubleFeature');

// TMDB 
const key = process.env.TMDB_API_KEY;
const movieURL = require('../config/tmdb').TMDB_MOVIE_BY_ID

// Paths
const paths = [ '/:username/all',
				'/:username/all/:page',
				'/:username/history',
				'/:username/history/:page',
				'/:username/likes',
				'/:username/likes/:page',
				'/:username/ratings',
				'/:username/ratings/:page',
				'/:username/ratings/rated/:rating/',
				'/:username/ratings/rated/:rating/:page'
			  ]

// @description     User page
// @route           GET /user/username
router.get('/:username', (req, res) => {
	const user = req.user;
	const username = req.params.username;
	User.find({
		username: username
	},
	function(error, user) {
		if (error) {
			console.error(error);
		} else {
			DoubleFeature.find({
				user: user[0]._id
			},
			function(error, doublefeatureList) {
				if (error) {
					console.error(error);
					console.log(doublefeatureList);
					res.render('users', {
						'user': user,
						'username': username,
						'doublefeatureList': doublefeatureList
					})
				} else {
					console.log(doublefeatureList);
					res.render('users', {
						'user': user,
						'username': username,
						'doublefeatureList': doublefeatureList
					});
				}
			}).sort( { createdAt: -1 } ).limit(8);
		}
	})
});

// @description     User Created Double Features
// @route           GET /user/username/all
router.get(paths.slice(0,2), (req, res) => {
	const user = req.user;
	const username = req.params.username;
	const doublefeaturePage = (req.params.page) ? req.params.page : 1;
	User.find({
		username: username
	},
	function(error, user) {
		if (error) {
			console.error(error);
		} else {
			DoubleFeature.countDocuments(
				{
					user: user[0]._id
				},
				function(error, doublefeatureCount) {
					if (error) {
						console.error(error);
					} else {
						DoubleFeature.find({
							user: user[0]._id
						},
						function(error, doublefeatureList) {
							if (error) {
								console.error(error);
								res.render('userall', {
									'user': user,
									'username': username,
									'doublefeatureCount': doublefeatureCount,
									'doublefeatureList': doublefeatureList,
									'doublefeturePage': doublefeaturePage
								})
							} else {
								res.render('userall', {
									'user': user,
									'username': username,
									'doublefeatureCount': doublefeatureCount,
									'doublefeatureList': doublefeatureList,
									'doublefeaturePage': doublefeaturePage
								});
							}
						}).sort( { createdAt: -1 } ).skip((doublefeaturePage - 1) * 16).limit(16);
					}
				}
			)
		}
	})
});

// @description     User Logged And Liked Double Features
// @route           GET /user/username/history & /user/username/likes
router.get(paths.slice(2, 6), (req, res) => {
	const user = req.user;
	const username = req.params.username;
	const doublefeaturePage = (req.params.page) ? req.params.page : 1;
	const splitter = req.originalUrl.split('/');
	let category;
	let renderPage;
	User.find({
		username: username
	},
	function(error, user) {
		if (error) {
			console.error(error);
		} else {
			switch(splitter[3]) {
				case 'history':
					category = user[0].watched;
					renderPage = 'userlogs';
					break;
				case 'likes':
					category = user[0].liked;
					renderPage = 'userlikes';
					break;
			}
			DoubleFeature.countDocuments(
				{
					_id: category
				},
				function(error, doublefeatureCount) {
					if (error) {
						console.error(error);
					} else {
						DoubleFeature.find({
							_id: category
						},
						function(error, doublefeatureList) {
							if (error) {
								console.error(error);
								res.render(renderPage, {
									'user': user,
									'username': username,
									'doublefeatureCount': doublefeatureCount,
									'doublefeatureList': doublefeatureList,
									'doublefeturePage': doublefeaturePage
								})
							} else {
								res.render(renderPage, {
									'user': user,
									'username': username,
									'doublefeatureCount': doublefeatureCount,
									'doublefeatureList': doublefeatureList,
									'doublefeaturePage': doublefeaturePage
								});
							}
						}).skip((doublefeaturePage - 1) * 16).limit(16);
					}
				}
			)
		}
	})
});

// @description     User Rated Double Features
// @route           GET /user/username/ratings
router.get(paths.slice(6, 8), (req, res) => {
	const user = req.user;
	const username = req.params.username;
	const doublefeaturePage = (req.params.page) ? req.params.page : 1;
	User.find({
		username: username
	},
	function(error, user) {
		if (error) {
			console.error(error);
		} else {
			DoubleFeature.countDocuments(
				{
					_id: user[0].rated
				},
				function(error, doublefeatureCount) {
					if (error) {
						console.error(error);
					} else {
						DoubleFeature.find({
							_id: user[0].rated
						},
						function(error, doublefeatureList) {
							if (error) {
								console.error(error);
							} else {
								Rating.find({
									user: user[0]._id
								},
								function(error, userRatings) {
									if (error) {
										console.error(error);
										res.render('userratings', {
											'user': user,
											'username': username,
											'doublefeatureCount': doublefeatureCount,
											'doublefeatureList': doublefeatureList,
											'userRatings': userRatings,
											'doublefeturePage': doublefeaturePage
										})
									} else {
										res.render('userratings', {
											'user': user,
											'username': username,
											'doublefeatureCount': doublefeatureCount,
											'doublefeatureList': doublefeatureList,
											'userRatings': userRatings,
											'doublefeaturePage': doublefeaturePage
										});
									}
								})
							}
						}).skip((doublefeaturePage - 1) * 16).limit(16);
					}
				}
			)
		}
	})
});

// @description     User <Rating> Double Features
// @route           GET /user/username/ratings/rated/rating
router.get(paths.slice(8, paths.length), (req, res) => {
	const user = req.user;
	const username = req.params.username;
	const doublefeaturePage = (req.params.page) ? req.params.page : 1;
	const rating = req.params.rating;
	User.find({
		username: username
	},
	function(error, user) {
		if (error) {
			console.error(error);
		} else {
			Rating.countDocuments(
				{
					user: user[0]._id,
					rating: rating
				},
				function(error, doublefeatureCount) {
					if (error) {
						console.error(error);
					} else {
						Rating.find({
							user: user[0]._id,
							rating: rating
						},
						function(error, ratingList) {
							if (error) {
								console.error(error);
							} else {
								let newArray = [];
								ratingList.forEach(element => newArray.push(element.doublefeature))
								DoubleFeature.find({
									_id: { $in: newArray }
								},
								function(error, doublefeatureList) {
									if (error) {
										console.error(error);
										res.render('userratingsnumber', {
											'user': user,
											'username': username,
											'doublefeatureCount': doublefeatureCount,
											'doublefeatureList': doublefeatureList,
											'userRatings': ratingList,
											'doublefeturePage': doublefeaturePage,
											'rating': rating
										})
									} else {
										res.render('userratingsnumber', {
											'user': user,
											'username': username,
											'doublefeatureCount': doublefeatureCount,
											'doublefeatureList': doublefeatureList,
											'userRatings': ratingList,
											'doublefeaturePage': doublefeaturePage,
											'rating': rating
										});
									}
								})
							}
						}).skip((doublefeaturePage-1) * 16).limit(16);
					}
				}
			)
		}
	})
});

// @description     Double Feature Page
// @route           GET /user/username/identifier/doublefeatureTitle
router.get('/:username/:identifier/:title', (req, res) => {
	const user = req.user;
	const username = req.params.username;
	const identifier = req.params.identifier
	const doublefeatureTitle = req.params.title
	let doublefeatureComments = [];
	var userRating;
	if (req.user) {
		User.findOne({
			username: req.user.username
		},
		function(error, user) {
			if (error) {
				console.error(error);
			} else {
				DoubleFeature.findOne({
					username: username, identifier: identifier
				},
				function(error, doublefeature) {
					Comment.find( { doublefeature: doublefeature },
					function(error, comments) {
						if (error) {
							console.error(error);
						} else {
							doublefeatureComments = comments;
							Rating.findOne({
								user: ObjectID(req.user._id),
								doublefeature: doublefeature
							},
							function(error, rating) {
								if (error) {
									console.error(error);
								} else {
									userRating = rating;
								}
							})
						}
					});
					if (error) {
						console.error(error);
					} else {
						if (doublefeature.movie_one_id === null) {
							axios.get(movieURL + doublefeature.movie_two_id + '?api_key=' + key)
							.then(response => {
								const movieOne = [];
								const movieTwo = response.data;
								let doublefeatureInfo = doublefeature;
								res.render('doublefeaturepage', {
									'user': user,
									'username': username,
									'doublefeatureInfo': doublefeatureInfo,
									'movieOne': movieOne,
									'movieTwo': movieTwo,
									'doublefeatureComments': doublefeatureComments,
									'userRating': userRating
								})
							})
							.catch(errors => {
								console.error(errors);
							})
						} else if (doublefeature.movie_two_id === null) {
							axios.get(movieURL + doublefeature.movie_one_id + '?api_key=' + key)
							.then(response => {
								const movieOne = response.data;
								const movieTwo = [];
								let doublefeatureInfo = doublefeature;
								res.render('doublefeaturepage', {
									'user': user,
									'username': username,
									'doublefeatureInfo': doublefeatureInfo,
									'movieOne': movieOne,
									'movieTwo': movieTwo,
									'doublefeatureComments': doublefeatureComments,
									'userRating': userRating
								})
							})
							.catch(errors => {
								console.error(errors);
							})
						} else {
							const movie_one = axios.get(movieURL + doublefeature.movie_one_id + '?api_key=' + key);
							const movie_two = axios.get(movieURL + doublefeature.movie_two_id + '?api_key=' + key);

							axios.all([movie_one, movie_two])
							.then(axios.spread((...responses) => {
								const movieOne = responses[0].data;
								const movieTwo = responses[1].data;

								let doublefeatureInfo = doublefeature;
								res.render('doublefeaturepage', {
									'user': user,
									'username': username,
									'doublefeatureInfo': doublefeatureInfo,
									'movieOne': movieOne,
									'movieTwo': movieTwo,
									'doublefeatureComments': doublefeatureComments,
									'userRating': userRating
								})
							}))
							.catch(errors => {
								console.error(errors);
							})
						}
					}
				})
			}
		})
	} else {
		let user;
		DoubleFeature.findOne({
			username: username, identifier: identifier
		},
		function(error, doublefeature) {
			if (error) {
				console.error(error);
			} else {
				Comment.find( { doublefeature: doublefeature },
					function(error, comments) {
						if (error) {
							console.error(error);
						} else {
							doublefeatureComments = comments;
						}
					});
				if (doublefeature.movie_one_id === null) {
					axios.get(movieURL + doublefeature.movie_two_id + '?api_key=' + key)
					.then(response => {
						const movieOne = [];
						const movieTwo = response.data;
						let doublefeatureInfo = doublefeature;
						res.render('doublefeaturepage', {
							'user': user,
							'username': username,
							'doublefeatureInfo': doublefeatureInfo,
							'movieOne': movieOne,
							'movieTwo': movieTwo,
							'doublefeatureComments': doublefeatureComments,
							'userRating': userRating
						})
					})
					.catch(errors => {
						console.error(errors);
					})
				} else if (doublefeature.movie_two_id === null) {
					axios.get(movieURL + doublefeature.movie_one_id + '?api_key=' + key)
					.then(response => {
						const movieOne = response.data;
						const movieTwo = [];
						let doublefeatureInfo = doublefeature;
						res.render('doublefeaturepage', {
							'user': user,
							'username': username,
							'doublefeatureInfo': doublefeatureInfo,
							'movieOne': movieOne,
							'movieTwo': movieTwo,
							'doublefeatureComments': doublefeatureComments,
							'userRating': userRating
						})
					})
					.catch(errors => {
						console.error(errors);
					})
				} else {
					const movie_one = axios.get(movieURL + doublefeature.movie_one_id + '?api_key=' + key);
					const movie_two = axios.get(movieURL + doublefeature.movie_two_id + '?api_key=' + key);

					axios.all([movie_one, movie_two])
					.then(axios.spread((...responses) => {
						const movieOne = responses[0].data;
						const movieTwo = responses[1].data;

						let doublefeatureInfo = doublefeature;
						res.render('doublefeaturepage', {
							'user': user,
							'username': username,
							'doublefeatureInfo': doublefeatureInfo,
							'movieOne': movieOne,
							'movieTwo': movieTwo,
							'doublefeatureComments': doublefeatureComments,
							'userRating': userRating
						})
					}))
					.catch(errors => {
						console.error(errors);
					})
				}
			}
		})
	}
	
});

// @description     Double Feature Page Page - Edit, Swap, Delete, Watch, Like, Rate, or Comment Double Feature Button
// @route           POST /movies/genre/:genreName/title
// 
router.post('/:username/:identifier/:title', (req, res) => {
	const username = req.user.username;
	if (req.body.formInstance === 'commentform') {
		const doublefeatureId = req.body.hiddenIdComment;
		const userId = req.user._id;

		const comment = new Comment();
		comment.comment = sanitize(req.body.comments);
		comment.username = username;
		comment.user = req.user;
		comment.doublefeature = ObjectID(doublefeatureId);
		comment.save((error) => {
			if (error) {
				console.error(error);
				req.flash('fail_create', 'Something went wrong');
				res.redirect('back');
			} else {
				DoubleFeature.findOneAndUpdate(
					{ _id: ObjectID(doublefeatureId) },
					{ $push:
						{ comments: comment }
					}
				)
				.then(result => {
					console.log(result);
				});
				req.flash('success_create', 'Comment successfully posted');
				res.redirect('back');
			}
		});

	} else if (req.body.formInstance === 'delcomform') {
		const commentId = req.body.hiddenCommentIdDelete;
		const doublefeatureId = req.body.hiddendfIdDelete;
		Comment.deleteOne( { _id: ObjectID(commentId) } )
		.then(result => {
			console.log(result);
		});
		DoubleFeature.findOneAndUpdate( 
			{ username: username },
			{ $pull: 
				{ 
					comments: ObjectID(commentId) 
				} 
			}
		)
		.then(result => {
			console.log(result);
		});
		req.flash('success_create', 'Comment successfully deleted');
		res.redirect('back');

	} else if (req.body.formInstance === 'editform') {
		const doublefeatureId = req.body.hiddenIdEdit;
		const doublefeatureTitle = sanitize(req.body.title);
		const doublefeatureDescription = sanitize(req.body.description);
		DoubleFeature.findOneAndUpdate(
			{ _id: ObjectID(doublefeatureId) },
			{ $set:
				{
					title: doublefeatureTitle,
					description: doublefeatureDescription
				}
			}
		)
		.then(result => {
			console.log(result);
		});
		req.flash('success_create', 'Double Feature successfully edited');
		res.redirect('back');

	} else if (req.body.formInstance === 'swapform') {
		const doublefeatureId = req.body.hiddenIdSwap;
		const movieOneId = req.body.hiddenMovieOneIdSwap;
		const movieOneTitle = req.body.hiddenMovieOneTitleSwap;
		const movieOnePoster = req.body.hiddenMovieOnePosterSwap;
		const movieTwoId = req.body.hiddenMovieTwoIdSwap;
		const movieTwoTitle = req.body.hiddenMovieTwoTitleSwap;
		const movieTwoPoster = req.body.hiddenMovieTwoPosterSwap;
		DoubleFeature.findOneAndUpdate(
			{ _id: ObjectID(doublefeatureId) },
			{ $set: 
				{ 
					movie_one_id: movieTwoId,
					movie_one_title: movieTwoTitle,
					movie_one_poster: movieTwoPoster,
					movie_two_id: movieOneId,
					movie_two_title: movieOneTitle,
					movie_two_poster: movieOnePoster
				}
			}
		)
		.then(result => {
			console.log(result);
		});
		req.flash('success_create', 'Movies successfully swapped');
		res.redirect('back');

	} else if (req.body.formInstance === 'delform') {
		const doublefeatureId = req.body.hiddenIdDelete;
		DoubleFeature.deleteOne( { _id: ObjectID(doublefeatureId) } )
		.then(result => {
			console.log(result);
		})
		Rating.deleteMany( { doublefeature: ObjectID(doublefeatureId) } )
		.then(result => {
			console.log(result);
		})
		Comment.deleteMany( { doublefeature: ObjectID(doublefeatureId) } )
		.then(result => {
			console.log(result);
		})
		User.findOneAndUpdate( 
			{ username: username },
			{ $pull: 
				{ 
					doublefeatures: ObjectID(doublefeatureId) 
				} 
			}
		)
		.then(result => {
			console.log(result);
		});
		req.flash('success_create', 'Double Feature successfully deleted');
		res.redirect('/users/' + username);
	} else if (req.body.formInstance === 'rateform') {
		console.log(req.body.rate);
		const userId = req.body.hiddenUserIdRate;
		const doublefeatureId = req.body.hiddenIdRate;
		if (req.body.hiddenRating) {
			User.findOneAndUpdate(
				{ _id: ObjectID(userId) },
				{ $addToSet: 
					{ 
						rated: ObjectID(doublefeatureId)
					} 
				}
			)
			.then(result => {
				if (!result.rated.includes(doublefeatureId)) {
					const rating = new Rating();

					rating.rating = req.body.hiddenRating;
					rating.user = ObjectID(userId);
					rating.doublefeature = ObjectID(doublefeatureId);
					rating.save((error) => {
						if (error) {
							console.error(error);
						} else {
							DoubleFeature.findOneAndUpdate(
								{ _id: ObjectID(doublefeatureId) },
								{ $inc:
									{
										rating_count: 0.5,
										rating_value: req.body.hiddenRating/2
									}
								},
								function(error, doublefeature) {
									if (error) {
										console.error(error);
									} else {
										const ratingCount = parseInt(doublefeature.rating_count) + 1;
										const ratingValue = parseInt(doublefeature.rating_value + parseInt(req.body.hiddenRating));
										const ratingAverage = ratingValue/ratingCount;
										const ratingWeighted = ((ratingCount*ratingAverage) + (100*6.9))/(ratingCount + 100);
										DoubleFeature.findOneAndUpdate(
											{ _id: ObjectID(doublefeatureId) },
											{ $set:
												{
													rating_average: ratingAverage,
													rating_weighted: ratingWeighted
												}
											})
											.then(result => {
												console.log(result);
											}
										);
									}
								}
							)
							.then(result => {
								console.log(result);
							});
						}
					})
				} else {
					Rating.findOneAndUpdate(
						{ user: req.user._id, doublefeature: ObjectID(doublefeatureId) },
						{ $set: { rating: req.body.hiddenRating } },
						function(error, oldRating) {
							if (error) {
								console.error(error);
							} else {

								DoubleFeature.findOneAndUpdate(
								{ _id: ObjectID(doublefeatureId) },
								{ $inc:
									{
										rating_value: (req.body.hiddenRating - oldRating.rating)
									}
								},
								function(error, doublefeature) {
									if (error) {
										console.error(error);
									} else {
										const ratingCount = parseInt(doublefeature.rating_count) + 1;
										const ratingValue = parseInt(doublefeature.rating_value + parseInt(req.body.hiddenRating));
										const ratingAverage = ratingValue/ratingCount;
										const ratingWeighted = ((ratingCount*ratingAverage) + (100*6.9))/(ratingCount + 100);
										DoubleFeature.findOneAndUpdate(
											{ _id: ObjectID(doublefeatureId) },
											{ $set:
												{
													rating_average: ratingAverage,
													rating_weighted: ratingWeighted
												}
											})
											.then(result => {
												console.log(result);
											}
										);
									}
								})
								.then(result => {
									console.log(result);
								});
							}
						}
					)
					.then(result => {
						console.log(result);
					});
				}
			});
		}

		if (req.body.rate) {
			if (req.body.rate.includes('watch')) {
				User.findOneAndUpdate(
					{ _id: ObjectID(userId) },
					{ $addToSet: 
						{ 
							watched: ObjectID(doublefeatureId)
						} 
					}
				)
				.then(result => {
					if (!result.watched.includes(doublefeatureId)) {
						DoubleFeature.findOneAndUpdate(
							{ _id: ObjectID(doublefeatureId) },
							{ $inc:
								{
									watch_count: 1
								}
							}
						)
						.then(result => {
							console.log(result);
						});
					}
				});
			}

			if (!req.body.rate.includes('watch')) {
				User.findOneAndUpdate(
					{ _id: ObjectID(userId) },
					{ $pull: 
						{ 
							watched: ObjectID(doublefeatureId)
						} 
					}
				)
				.then(result => {
					if (result.watched.includes(doublefeatureId)) {
						DoubleFeature.findOneAndUpdate(
							{ _id: ObjectID(doublefeatureId) },
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
				});
			}

			if (req.body.rate.includes('like')) {
				User.findOneAndUpdate(
					{ _id: ObjectID(userId) },
					{ $addToSet: 
						{ 
							liked: ObjectID(doublefeatureId)
						} 
					}
				)
				.then(result => {
					if (!result.liked.includes(doublefeatureId)) {
						DoubleFeature.findOneAndUpdate(
							{ _id: ObjectID(doublefeatureId) },
							{ $inc:
								{
									like_count: 1
								}
							}
						)
						.then(result => {
							console.log(result);
						});
					}
				});
			}

			if (!req.body.rate.includes('like')) {
				User.findOneAndUpdate(
					{ _id: ObjectID(userId) },
					{ $pull: 
						{ 
							liked: ObjectID(doublefeatureId)
						} 
					}
				)
				.then(result => {
					if (result.liked.includes(doublefeatureId)) {
						DoubleFeature.findOneAndUpdate(
							{ _id: ObjectID(doublefeatureId) },
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
				});
			}

		} else {
			User.findOneAndUpdate(
				{ _id: ObjectID(userId) },
				{ $pull: 
					{ 
						watched: ObjectID(doublefeatureId)
					} 
				}
			)
			.then(result => {
				if (result.watched.includes(doublefeatureId)) {
					DoubleFeature.findOneAndUpdate(
						{ _id: ObjectID(doublefeatureId) },
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
			});
			User.findOneAndUpdate(
				{ _id: ObjectID(userId) },
				{ $pull: 
					{ 
						liked: ObjectID(doublefeatureId)
					} 
				}
			)
			.then(result => {
				if (result.liked.includes(doublefeatureId)) {
					DoubleFeature.findOneAndUpdate(
						{ _id: ObjectID(doublefeatureId) },
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
			});
		}
		req.flash('success_create', 'Double Featured successfully logged');
		res.redirect('back');
	}

});

module.exports = router;
