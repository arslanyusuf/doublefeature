const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
	comment: {
		type: String
	},
	username: {
		type: String
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true
	},
	doublefeature: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "DoubleFeature",
		required: true,
		index: true
	}
}, {timestamps: true});

// Compound Index
CommentSchema.index( { doublefeature: 1, user: 1 } );

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
