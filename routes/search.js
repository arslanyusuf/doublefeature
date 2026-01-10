const axios = require('axios');
const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const sanitize = require('mongo-sanitize');

// Instace of Router
const router = express.Router();

// Models
const User = require('../models/User');
const DoubleFeature = require('../models/DoubleFeature');

// TMDB 
const key = process.env.TMDB_API_KEY;
const movieSearch = require('../config/tmdb').TMDB_MOVIE_SEARCH
const personSearch = require('../config/tmdb').TMDB_PERSON_SEARCH

// Regex Function for Fuzzy Search of DoubleFeature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// @description     Search page
// @route           GET /search
router.get('/', async (req, res) => {
	const user = req.user;
	const searchTerm = sanitize(req.query.query);
	const searchType = sanitize(req.query.type);
	if (searchType === 'person') {
		axios.get(personSearch + 'api_key=' + key + '&query=' + searchTerm)
		.then(response => {
			res.render('searchperson', {
				'user': user,
				'personData': response.data,
				'searchTerm': searchTerm,
				'personPage': 1
			});
		})
		.catch(error => {
			console.error(error);
		});

	} else if (searchType === 'doublefeature') {
		const regex = new RegExp(escapeRegex(searchTerm), 'gi');
        try {
            const doublefeatureData = await DoubleFeature.find({ 
                $or: [
                    { title: regex },
                    { movie_one_title: regex },
                    { movie_two_title: regex }
                ]});
            res.render('searchdoublefeature', {
                'user': user,
                'doublefeatureData': doublefeatureData,
                'searchTerm': searchTerm,
                'doublefeaturePage': 1
            });
        } catch (error) {
            console.error(error);
        }

	} else {
		axios.get(movieSearch + 'api_key=' + key + '&include_adult=false&query=' + searchTerm)
		.then(async response => { // Mark callback as async
			if (user) {
                try {
                    const doubleFeatureEmpty = await DoubleFeature.find({ 
                        $or: [ 
                            { $and: [ { movie_one_id: null }, { user: user } ] },
                            { $and: [ { movie_two_id: null }, { user: user } ] }
                        ]});
                    res.render('searchmovie', {
                        'user': user,
                        'movieData': response.data,
                        'searchTerm': searchTerm,
                        'doubleFeatureEmpty': doubleFeatureEmpty,
                        'moviePage': 1
                    });
                } catch (error) {
                    console.error(error);
                }
			} else {
				const doubleFeatureEmpty = [];
				res.render('searchmovie', {
					'user': user,
					'movieData': response.data,
					'searchTerm': searchTerm,
					'doubleFeatureEmpty': doubleFeatureEmpty,
					'moviePage': 1
				});
			}
		})
		.catch(error => {
			console.error(error);
		});
	}
});

// @description     Search Page - Add Movie to Double Feature Button & Create New Empty Double Feature Button 
// @route           POST /search
router.post('/', async (req, res) => {
	const movieId = parseInt(req.body.hiddenId, 10);
	const movieTitle = req.body.hiddenTitle;
	const moviePoster = req.body.hiddenPoster;
	if (req.body.formInstance === 'form1') {
        try {
            const doublefeature = await DoubleFeature.findById(ObjectID(req.body.emptydoublefeature));
            if (doublefeature.movie_one_id === null) {
                doublefeature.movie_one_id = movieId;
                doublefeature.movie_one_title = movieTitle;
                doublefeature.movie_one_poster = moviePoster;
            } else {
                doublefeature.movie_two_id = movieId;
                doublefeature.movie_two_title = movieTitle;
                doublefeature.movie_two_poster = moviePoster;
            }

            await doublefeature.save();
            req.flash('success_create', '\'' + movieTitle + '\' was successfully added to \'' + doublefeature.title + '\'' );
            res.redirect('back');
        } catch (error) {
            console.error(error);
            req.flash('fail_create', 'Something went wrong');
            res.redirect('back');
        }

	} else if (req.body.formInstance === 'form2') {
		const doublefeature = new DoubleFeature();

		doublefeature.identifier = Math.floor(Date.now()/1000);
		doublefeature.movie_one_id = movieId;
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
        
        try {
            await doublefeature.save();
            const user = await User.findById(req.user.id);
            user.doublefeatures.push(doublefeature);
            await user.save();
            
            req.flash('success_create', '\'' + req.body.title + '\' was successfully created with \'' + movieTitle + '\'');
            res.redirect('back');
        } catch (error) {
            console.error(error);
            req.flash('fail_create', 'Something went wrong');
            res.redirect('back');
        }
	}
});

// @description     Movie Results Page
// @route           GET /search/movie/query/page
router.get('/movie/:searchTerm/:page', (req, res) => {
	const user = req.user;
	const searchTerm = sanitize(req.params.searchTerm);
	const moviePage = req.params.page;
	axios.get(movieSearch + 'api_key=' + key +'&query=' + searchTerm + '&page=' + moviePage)
	.then(async response => {
		if (user) {
            try {
                const doubleFeatureEmpty = await DoubleFeature.find({ 
                    $or: [ 
                        { $and: [ { movie_one_id: null }, { user: user } ] },
                        { $and: [ { movie_two_id: null }, { user: user } ] }
                    ]});
                res.render('searchmovie', {
                    'user': user,
                    'movieData': response.data,
                    'searchTerm': searchTerm,
                    'doubleFeatureEmpty': doubleFeatureEmpty,
                    'moviePage': moviePage
                });
            } catch (error) {
                console.error(error);
            }
		} else {
			const doubleFeatureEmpty = [];
			res.render('searchmovie', {
				'user': user,
				'movieData': response.data,
				'searchTerm': searchTerm,
				'doubleFeatureEmpty': doubleFeatureEmpty,
				'moviePage': moviePage
			});
		}
	})
	.catch(error => {
		console.error(error);
		res.render('404', {
			layout: 'layouts/infinity'
		})
	});
});

// @description     Movie Results Page - Add Movie to Double Feature Button & Create New Empty Double Feature Button 
// @route           POST /search/movie/query/page
router.post('/movie/:searchTerm/:page', async (req, res) => {
	const movieId = parseInt(req.body.hiddenId, 10);
	const movieTitle = req.body.hiddenTitle;
	const moviePoster = req.body.hiddenPoster;
	if (req.body.formInstance === 'form1') {
        try {
            const doublefeature = await DoubleFeature.findById(ObjectID(req.body.emptydoublefeature));
            if (doublefeature.movie_one_id === null) {
                doublefeature.movie_one_id = movieId;
                doublefeature.movie_one_title = movieTitle;
                doublefeature.movie_one_poster = moviePoster;
            } else {
                doublefeature.movie_two_id = movieId;
                doublefeature.movie_two_title = movieTitle;
                doublefeature.movie_two_poster = moviePoster;
            }

            await doublefeature.save();
            req.flash('success_create', '\'' + movieTitle + '\' was successfully added to \'' + doublefeature.title + '\'' );
            res.redirect('back');
        } catch (error) {
             console.error(error);
             req.flash('fail_create', 'Something went wrong');
             res.redirect('back');
        }

	} else if (req.body.formInstance === 'form2') {
		const doublefeature = new DoubleFeature();

		doublefeature.identifier = Math.floor(Date.now()/1000);
		doublefeature.movie_one_id = movieId;
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
        
        try {
            await doublefeature.save();
            const user = await User.findById(req.user.id);
            user.doublefeatures.push(doublefeature);
            await user.save();
            
            req.flash('success_create', '\'' + req.body.title + '\' was successfully created with \'' + movieTitle + '\'');
            res.redirect('back');
        } catch (error) {
            console.error(error);
            req.flash('fail_create', 'Something went wrong');
            res.redirect('back');
        }
	}
});

// @description     Person Results Page
// @route           GET /search/person/query/page
router.get('/person/:searchTerm/:page', (req, res) => {
	const user = req.user;
	const searchTerm = sanitize(req.params.searchTerm);
	const personPage = req.params.page;
	axios.get(personSearch + 'api_key=' + key +'&query=' + searchTerm + '&page=' + personPage)
	.then(response => {
		res.render('searchperson', {
			'user': user,
			'personData': response.data,
			'searchTerm': searchTerm,
			'personPage': personPage
		});
	})
	.catch(error => {
		res.render('404', {
			layout: 'layouts/infinity'
		})
	});
});

// @description     Double Feature Results Page
// @route           GET /search/doublefeature/query/page
router.get('/doublefeature/:searchTerm/:page', async (req, res) => {
	const user = req.user;
	const searchTerm = sanitize(req.params.searchTerm);
	const doublefeaturePage = req.params.page;
	const regex = new RegExp(escapeRegex(searchTerm), 'gi');
    try {
        const doublefeatureData = await DoubleFeature.find({ 
            $or: [
                { title: regex },
                { movie_one_title: regex },
                { movie_two_title: regex }
            ]});
        res.render('searchdoublefeature', {
            'user': user,
            'doublefeatureData': doublefeatureData,
            'searchTerm': searchTerm,
            'doublefeaturePage': doublefeaturePage
        });
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;
