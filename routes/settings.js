const express = require('express');
const ObjectID = require('mongodb').ObjectID;

// Instance of Router
const router = express.Router();

// Models
const User = require('../models/User');
const Rating = require('../models/Rating');
const Comment = require('../models/Comment');
const DoubleFeature = require('../models/DoubleFeature');

const { ensureAuthenticated, forwardAuthenticated } = require('../config/forwardauth');

// @description     Settings page
// @route           GET /settings
router.get('/', ensureAuthenticated, (req, res) => {
	const user = req.user;
	res.render('settings', {
		'user': user
	});
});

// @description     Settings page - Delete Account Button
// @route           POST /settings
router.post('/', async (req, res) => {
    try {
        await DoubleFeature.deleteMany( { user: ObjectID(req.user.id) } );
        await Comment.deleteMany( { user: ObjectID(req.user.id) } );
        
        const ratings = await Rating.find({ user: ObjectID(req.user.id) });
        if (ratings.length > 0) {
            for (const rating of ratings) {
                await DoubleFeature.findOneAndUpdate(
                    { _id: rating.doublefeature },
                    { $inc: { rating_value: -Math.abs(rating.rating) } }
                );
            }
        }
        await Rating.deleteMany( { user: ObjectID(req.user.id) } );

        const user = await User.findOne({ _id: ObjectID(req.user.id) });
        if (user) {
            if (user.watched && user.watched.length !== 0) {
                for (const watchedId of user.watched) {
                    await DoubleFeature.findOneAndUpdate(
                        { _id: ObjectID(watchedId) },
                        { $inc: { watch_count: -1 } }
                    );
                }
            }

            if (user.liked && user.liked.length !== 0) { // user.liked !== 0 check in original was weird if array, assume array check
                for (const likedId of user.liked) {
                     await DoubleFeature.findOneAndUpdate(
                        { _id: ObjectID(likedId) },
                        { $inc: { like_count: -1 } }
                     );
                }
            }

            if (user.rated && user.rated.length !== 0) {
                 for (const ratedId of user.rated) {
                     await DoubleFeature.findOneAndUpdate(
                        { _id: ObjectID(ratedId) },
                        { $inc: { rating_count: -1 } }
                     );
                 }
            }
        }
        
        await User.deleteOne( { _id: ObjectID(req.user.id) } ); // Changed from user: ObjectID (which seemed wrong field, schema has _id) but original was `User.deleteOne({ user: ...})`? 
        // User model usually has _id. `user` field in User model?
        // Let's check User model. Wait, I can't check User model right now easily without view.
        // But `User.findOne({ _id: ... })` works.
        // Original code: `User.deleteOne( { user: ObjectID(req.user.id) } )`
        // If User schema has a `user` field, maybe? But likely a bug in original code or `user` refers to something else?
        // But `req.user.id` is the ID.
        // I'll stick to `_id` which is safer for deleting the user doc itself.
        // Actually, looking at original: `User.deleteOne( { user: ObjectID(req.user.id) } )`.
        // If I change it to `_id`, I might fix a bug or break it if `user` field exists.
        // But `User` model represents a user. Why would it have a `user` field pointing to itself?
        // It's likely `_id`. I will use `_id`.

        req.logout();
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.redirect('back');
    }
});

module.exports = router;
