const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		index: true,
		unique: true,
		uniqueCaseInsensitive: true,
		match: [/^[a-zA-Z0-9\-\_]+$/, 'is invalid']
	},
	email: {
		type: String,
		required: true,
		index: true,
		unique: true,
		uniqueCaseInsensitive: true,
		match: [/\S+@\S+\.\S+/, 'is invalid']
	},
	password: {
		type: String,
		required: true
	},
	is_verified: {
		type: Boolean,
		default: false
	},
	doublefeatures: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "DoubleFeature"
	}],
	watched: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "DoubleFeature"
	}],
	liked: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "DoubleFeature"
	}],
	rated: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "DoubleFeature"
	}]
}, {timestamps: true});

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

const User = mongoose.model('User', UserSchema);

module.exports = User;
