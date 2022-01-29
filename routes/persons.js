const express = require('express');
const axios = require('axios');

// Instance of Router
const router = express.Router();

// TMDB 
const key = process.env.TMDB_API_KEY;
const personURL = require('../config/tmdb').TMDB_PERSON_BY_ID

// Paths
const paths = [ '/:id/:name',
				'/:id/:name/title',
				'/:id/:name/release-newest',
				'/:id/:name/release-oldest'
			  ];

// @description     Persons Page By Popularity
// @route           GET /persons/personID/personName
router.get(paths, (req, res) => {
	const user = req.user;
	const personID = req.params.id;
	const splitter = req.originalUrl.split('/');
	const sortedBy = splitter[4];
	axios.get(personURL + personID + '?api_key=' + key + '&append_to_response=movie_credits')
	.then(response => {
		const moviesStarred = [];
		const moviesDirected = [];
		const moviesWritten = [];
		const moviesEdited = [];
		const moviesShot = [];
		const moviesComplete = [];
		const moviesCompleteSorted = [];
		response.data.movie_credits.cast.forEach(entry => {
			moviesStarred.push(entry);
		});
		response.data.movie_credits.crew.forEach(entry => {
			if (entry.job === 'Director') {
				moviesDirected.push(entry);
			} else if (entry.job === 'Screenplay' || entry.job === 'Writer' || entry.job === "Story") {
		    	var unique = true;
		    	if (moviesWritten.length === 0) {
		    		moviesWritten.push(entry)
		    	} else {
		    		moviesWritten.forEach(w => {
		    			if (w.id === entry.id) {
		    				unique = false;
		    			}
		    		})
		    		if (unique) {
		    		moviesWritten.push(entry)
		    		}
		    	}
		    } else if (entry.job === 'Editor') {
		    	moviesEdited.push(entry);
		    } else if (entry.job === 'Director of Photography' || entry.job === 'Cinematography') {
		    	moviesShot.push(entry);
		    }
		});
		moviesComplete.push(moviesStarred);
		moviesComplete.push(moviesDirected);
		moviesComplete.push(moviesWritten);
		moviesComplete.push(moviesEdited);
		moviesComplete.push(moviesShot);
		moviesComplete.sort((a, b) => {
			return b.length - a.length;
		})
		moviesComplete.forEach(category => {
			category.sort((a, b) => {
				switch (sortedBy) {
					case 'title':
						if (stripLeadingArticle( a.title ) > stripLeadingArticle( b.title )) {
							return 1;
						} else if (stripLeadingArticle( a.title ) < stripLeadingArticle( b.title )) {
							return -1;
						} else { 
							return 0;
						}
					case 'release-newest':
						return Date.parse(b.release_date) - Date.parse(a.release_date);
					case 'release-oldest':
						return Date.parse(a.release_date) - Date.parse(b.release_date);
					default:
						return b.popularity - a.popularity;
				}
			})
			moviesCompleteSorted.push(category)
		})
		res.render('personpage', {
			'user': user,
			'personData': response.data,
			'moviesCompleteSorted': moviesCompleteSorted,
			'sortedBy': sortedBy
		});
	})
	.catch(error => {
		console.error(error);
	});
});

function stripLeadingArticle( str ) {
	words = str.split(" ");
	if(words.length <= 1) {
		return str;
	}
	if( words[0] == 'A' || words[0] == 'The' || words[0] == 'An' ) {
		return words.splice(1).join(" ");
	}
	return str;
}

module.exports = router;
