const mongoose = require('mongoose');

const DoubleFeatureSchema = new mongoose.Schema({
	identifier: {
		type: Number,
		required: true,
		index: true
	},
	title: {
		type: String,
		required: true,
		text: true
	},
	movie_one_id: {
		type: Number,
		index: true
	},
	movie_one_title: {
		type: String,
		text: true
	},
	movie_one_poster: {
		type: String
	},
	movie_two_id: {
		type: Number,
		index: true
	},
	movie_two_title: {
		type: String,
		text: true
	},
	movie_two_poster: {
		type: String
	},
	description: {
		type: String
	},
	watch_count: {
		type: Number
	},
	like_count: {
		type: Number,
	},
	rating_count: {
		type: Number
	},
	rating_value: {
		type: Number
	},
	rating_average: {
		type: Number
	},
	rating_weighted: {
		type: Number
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	username: {
		type: String,
		required: true
	},
	comments: [{
	    type: mongoose.Schema.Types.ObjectId,
	    ref: "Comment"
	}]
}, {timestamps: true});

/* Formula for weighted rating (Bayesian Average):
rating_weighted = (((rating_count * rating_average) + (min_number * mean_vote))/(rating_count + min_number)
rating_count : the number of ratings the doublefeature has
rating_average: the mean rating of the movie
min_number (constant): minimum number of votes = 100 (will increase with number of users registered)
mean_vote (constant): the mean vote = 6.9 (nice)
*/

// Compound Index
DoubleFeatureSchema.index( { movie_one_id: 1, rating_weighted: -1 } );
DoubleFeatureSchema.index( { movie_two_id: 1, rating_weighted: -1 } );
DoubleFeatureSchema.index( { username: 1, identifier: 1 } );

const DoubleFeature = mongoose.model('DoubleFeature', DoubleFeatureSchema);

module.exports = DoubleFeature;
