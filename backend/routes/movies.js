const axios = require('axios');
const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const sanitize = require('mongo-sanitize');

// Instance of Router
const router = express.Router();

// Models
const User = require('../models/User');
const DoubleFeature = require('../models/DoubleFeature');

// TMDB 
const key = process.env.TMDB_API_KEY;
const movieURL = require('../config/tmdb').TMDB_MOVIE_BY_ID
const discoverURL = require('../config/tmdb').TMDB_MOVIE_DISCOVER
const trendingURL = require('../config/tmdb').TMDB_MOVIE_TRENDING

// Paths
const paths = [ '/popular',
				'/popular/:page',
				'/genre/:name/title',
				'/genre/:name/title/:page',
				'/genre/:name/release-newest',
				'/genre/:name/release-newest/:page',
				'/genre/:name/release-oldest',
				'/genre/:name/release-oldest/:page',
				'/genre/:name',
				'/genre/:name/:page'];

// Movie Genres
const genres = [
	{ id: 28, name: 'Action' },
	{ id: 12, name: 'Adventure' },
	{ id: 16, name: 'Animation' },
	{ id: 35, name: 'Comedy' },
	{ id: 80, name: 'Crime' },
	{ id: 99, name: 'Documentary' },
	{ id: 18, name: 'Drama' },
	{ id: 10751, name: 'Family' },
	{ id: 14, name: 'Fantasy' },
	{ id: 36, name: 'History' },
	{ id: 27, name: 'Horror' },
	{ id: 10402, name: 'Music' },
	{ id: 9648, name: 'Mystery' },
	{ id: 10749, name: 'Romance' },
	{ id: 878, name: 'Science Fiction' },
	{ id: 10770, name: 'Tv Movie' },
	{ id: 53, name: 'Thriller' },
	{ id: 10752, name: 'War' },
	{ id: 37, name: 'Western' }
];

// @description     Movies Page By Popularity
// @route           GET /movies/page
router.get(paths.slice(0, 2), (req, res) => {
	const user = req.user;
	const moviePage = (req.params.page) ? req.params.page : 1;
	let movieData = [];
	const page_one = axios.get(trendingURL + '?api_key=' + key + '&page=' + ((moviePage*2)-1));
	const page_two = axios.get(trendingURL + '?api_key=' + key + '&page=' + (moviePage*2));
	axios.all([page_one, page_two])
	.then(axios.spread((...responses) => {
		responses[0].data.results.forEach(element => movieData.push(element));
		responses[1].data.results.forEach(element => movieData.push(element));
		if (user) {
			DoubleFeature.find({ 
				$or: [ 
				{ $and: [ { movie_one_id: null }, { user: user } ] },
				{ $and: [ { movie_two_id: null }, { user: user } ] }
				]},
			function(error, doubleFeatureEmpty) {
				if (error) {
					console.error(error);
				} else {
					res.render('moviespopular', {
						'user': user,
						'movieData': movieData,
						'doubleFeatureEmpty': doubleFeatureEmpty,
						'moviePage': moviePage
					});
				}
			})
		} else {
			doubleFeatureEmpty = [];
			res.render('moviespopular', {
				'user': user,
				'movieData': movieData,
				'doubleFeatureEmpty': doubleFeatureEmpty,
				'moviePage': moviePage
			});
		}
	}))
	.catch(error => {
		console.error(error);
	});
})


// @description     Movie Genres Page By Title, Ascending Release Date, Descending Release Date, Popularity
// @route           GET /movies/genre/genreName/release-desc/page
router.get(paths.slice(2, paths.length), (req, res) => {
	const user = req.user;
	const splitter = req.originalUrl.split('/');
	const sortedBy = splitter[4];
	const moviePage = (req.params.page) ? req.params.page : 1;
	const genreName = ((req.params.name).replace("-", " ")).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    const genre = genres.find(g => g.name === genreName);
	let movieData = [];
	let sortBy;
	switch (sortedBy) {
		case 'title':
			sortBy = 'original_title.asc';
			break;
		case 'release-newest':
			sortBy = 'primary_release_date.desc';
			break;
		case 'release-oldest':
			sortBy = 'primary_release_date.asc';
			break;
		default:
			sortBy = 'popularity.desc';
			break;
	}
	const page_one = axios.get(discoverURL + '?api_key=' + key + '&sort_by=' + sortBy + '&with_genres=' + genre.id + '&page=' + ((moviePage*2)-1));
	const page_two = axios.get(discoverURL + '?api_key=' + key + '&sort_by=' + sortBy + '&with_genres=' + genre.id + '&page=' + (moviePage*2));
	axios.all([page_one, page_two])
	.then(axios.spread((...responses) => {
		responses[0].data.results.forEach(element => movieData.push(element));
		responses[1].data.results.forEach(element => movieData.push(element));
		if (user) {
			DoubleFeature.find({ 
				$or: [ 
					{ $and: [ { movie_one_id: null }, { user: user } ] },
					{ $and: [ { movie_two_id: null }, { user: user } ] }
				]},
			function(error, doubleFeatureEmpty) {
				if (error) {
					console.error(error);
				} else {
					res.render('moviesgenre', {
						'user': user,
						'movieData': movieData,
						'doubleFeatureEmpty': doubleFeatureEmpty,
						'moviePage': moviePage,
						'genres': genres,
						'genreName': genreName,
						'totalResults': responses[0].data.total_results,
						'sortedBy': sortedBy
					});
				}
			})
		} else {
			doubleFeatureEmpty = [];
			res.render('moviesgenre', {
				'user': user,
				'movieData': movieData,
				'doubleFeatureEmpty': doubleFeatureEmpty,
				'moviePage': moviePage,
				'genres': genres,
				'genreName': genreName,
				'totalResults': responses[0].data.total_results,
				'sortedBy': sortedBy
			});
		}
	}))
	.catch(error => {
		console.error(error);
	});
});

// @description     Add Movie to Double Feature OR Create New Empty Double
// @route           POST /movies/paths[]
router.post(paths, (req, res) => {
	const movieID = parseInt(req.body.hiddenId, 10);
	const movieTitle = req.body.hiddenTitle;
	const moviePoster = req.body.hiddenPoster;
	if (req.body.formInstance === 'form1') {
		addToDoubleFeature(req, res, movieID, movieTitle, moviePoster);

	} else if (req.body.formInstance === 'form2') {
		createDoubleFeature(req, res, movieID, movieTitle, moviePoster);
	}
});

// @description     Individual Movies Page
// @route           GET /movies/movieID/movieTitle
router.get('/:id/:title', (req, res) => {
	const user = req.user;
	const movieID = req.params.id;
	axios.get(movieURL + movieID + '?api_key=' + key + '&append_to_response=credits')
	.then(response => {
		const directors = [];
		const writers = [];
		const editors = [];
		const cinematographer = [];
		response.data.credits.crew.forEach(entry => {
		    if (entry.job === 'Director') {
		        directors.push(entry);
		    } else if (entry.job === 'Screenplay' || entry.job === 'Writer' || entry.job === "Story") {
		    	var unique = true;
		    	if (writers.length === 0) {
		    		writers.push(entry)
		    	} else {
		    		writers.forEach(w => {
		    			if (w.id === entry.id) {
		    				unique = false;
		    			}
		    		})
		    		if (unique) {
		    		writers.push(entry)
		    		}
		    	}
		    } else if (entry.job === 'Editor') {
		    	editors.push(entry);
		    } else if (entry.job === 'Director of Photography' || entry.job === 'Cinematography') {
		    	cinematographer.push(entry);
		    }
		})
		DoubleFeature.find({
			$or: [ { movie_one_id: movieID }, { movie_two_id: movieID } ]
			},
		function(error, doublefeaturePopular) {
			if (error) {
				console.error(error);
			} else {
				if (user) {
					DoubleFeature.find({ 
						$or: [ 
						{ $and: [ { movie_one_id: null }, { user: user } ] },
						{ $and: [ { movie_two_id: null }, { user: user } ] }
						]},
					function(err, doubleFeatureEmpty) {
						if (error) {
							console.error(error);
						} else {
							res.render('moviepage', {
								'user': user,
								'movieData': response.data,
								'movieDirector': directors,
								'movieWriter': writers,
								'movieEditor': editors,
								'movieCinematographer': cinematographer,
								'doubleFeatureEmpty': doubleFeatureEmpty,
								'doublefeaturePopular': doublefeaturePopular
							});
						}
					})
				} else {
					doubleFeatureEmpty = [];
					res.render('moviepage', {
						'user': user,
						'movieData': response.data,
						'movieDirector': directors,
						'movieWriter': writers,
						'movieEditor': editors,
						'movieCinematographer': cinematographer,
						'doubleFeatureEmpty': doubleFeatureEmpty,
						'doublefeaturePopular': doublefeaturePopular
					});
				}
			}
		}).sort( { rating_weighted: -1 } ).limit(4);
	})
	.catch(error => {
		console.error(error);
	});
});

// @description     Individual Movie Page - Add Movie to Double Feature OR Create New Empty Double 
// @route           POST /movies/movieID/movieTitle
router.post('/:id/:title', (req, res) => {
	const movieID = req.params.id;
	const movieTitleAdd = req.body.hiddenTitleAdd;
	const moviePosterAdd = req.body.hiddenPosterAdd;
	const movieTitleCreate = req.body.hiddenTitleCreate;
	const moviePosterCreate = req.body.hiddenPosterCreate;
	if (req.body.formInstance === 'form1') {
		addToDoubleFeature(req, res, movieID, movieTitleAdd, moviePosterAdd);

	} else if (req.body.formInstance === 'form2') {
		createDoubleFeature(req, res, movieID, movieTitleCreate, moviePosterCreate);
	}
});

// Create New Double Feature
function createDoubleFeature(req, res, movieID, movieTitle, moviePoster) {
	const doublefeature = new DoubleFeature();

	doublefeature.identifier = Math.floor(Date.now()/1000);
	doublefeature.movie_one_id = movieID;
	doublefeature.movie_one_title = movieTitle;
	doublefeature.movie_one_poster = moviePoster;
	doublefeature.movie_two_id = null;
	doublefeature.movie_two_title = null;
	doublefeature.movie_two_poster = null;
	doublefeature.title = sanitize(req.body.title);
	doublefeature.user = req.user;
	doublefeature.username = req.user.username;
	doublefeature.description = sanitize(req.body.description);
	doublefeature.watch_count = 0;
	doublefeature.like_count = 0;
	doublefeature.rating_count = 0;
	doublefeature.rating_value = 0;
	doublefeature.rating_average = 0;
	doublefeature.rating_weighted = 0;
	doublefeature.save((error) => {
		if (error) {
			console.error(error);
			req.flash('fail_create', 'Something went wrong');
			res.redirect('back');
		} else {
			User.findById(req.user.id).then(user => {
				user.doublefeatures.push(doublefeature);
				user.save(function(error, doc) {
					if (error) {
						console.error(error);
					} else {
						console.log("Double Feature created successfully.")
					}
				});
			});
			req.flash('success_create', '\'' + req.body.title + '\' was successfully created with \'' + movieTitle + '\'');
			res.redirect('back');
		}
	});
}

// Add To Existing Double Feature
function addToDoubleFeature(req, res, movieID, movieTitle, moviePoster) {
	DoubleFeature.findById(ObjectID(req.body.emptydoublefeature))
	.then(doublefeature => {
		if (doublefeature.movie_one_id === null) {
			doublefeature.movie_one_id = movieID;
			doublefeature.movie_one_title = movieTitle;
			doublefeature.movie_one_poster = moviePoster;
		} else {
			doublefeature.movie_two_id = movieID;
			doublefeature.movie_two_title = movieTitle;
			doublefeature.movie_two_poster = moviePoster;
		}

		doublefeature.save((error) => {
			if (error) {
				console.error(error);
				req.flash('fail_create', 'Something went wrong');
				res.redirect('back');
			} else {
				req.flash('success_create', '\'' + movieTitle + '\' was successfully added to \'' + doublefeature.title + '\'' );
				res.redirect('back');
			}
		})
	})
	.catch(error => {
		console.error(error);
	});
}

module.exports = router;
