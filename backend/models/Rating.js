const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
	rating: {
		type: Number,
		index: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	doublefeature: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "DoubleFeature",
		required: true
	}
}, {timestamps: true});

const Rating = mongoose.model('Rating', RatingSchema);

module.exports = Rating;
