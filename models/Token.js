const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	token: {
		type: String,
		required: true
	},
	expired_at: {
		type: Date,
		default: Date.now,
		index: {
			expires: 86400000
		}
	}
}, {timestamps: true});

const Token = mongoose.model('Token', TokenSchema);

module.exports = Token;
