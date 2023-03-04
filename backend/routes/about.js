const express = require('express');

// Instance of Router
const router = express.Router();

// @description     About page - About Us
// @route           GET /about/me
router.get('/me', (req, res) => {
	const user = req.user;
	res.render('me', {
		'user': user
	});
});


// @description     About page - TMDB Attribution
// @route           GET /about/film-data
router.get('/film-data', (req, res) => {
	const user = req.user;
	res.render('filmdata', {
		'user': user
	});
});

module.exports = router;
