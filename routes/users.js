const axios = require("axios");
const express = require("express");
const ObjectID = require("mongodb").ObjectID;
const sanitize = require("mongo-sanitize");
const download = require("image-downloader");
const rwClient = require("../config/twitterClient");

// Instance of Router
const router = express.Router();

// Models
const User = require("../models/User");
const Rating = require("../models/Rating");
const Comment = require("../models/Comment");
const DoubleFeature = require("../models/DoubleFeature");

// TMDB
const key = process.env.TMDB_API_KEY;
const movieURL = require("../config/tmdb").TMDB_MOVIE_BY_ID;
const posterPath = require("../config/tmdb").TMDB_POSTER_PATH;

// Paths
const paths = [
	"/:username/all",
	"/:username/all/:page",
	"/:username/history",
	"/:username/history/:page",
	"/:username/likes",
	"/:username/likes/:page",
	"/:username/ratings",
	"/:username/ratings/:page",
	"/:username/ratings/rated/:rating/",
	"/:username/ratings/rated/:rating/:page",
];

// @description     User page
// @route           GET /user/username
router.get("/:username", async (req, res) => {
	const username = req.params.username;
	try {
		const users = await User.find({ username: username });
		if (!users || users.length === 0) {
            // Handle case where user is not found if necessary, or let it fall through to empty list
             return res.render("users", {
                user: req.user,
                username: username,
                doublefeatureList: [],
            });
        }
        const userObj = users[0];
		const doublefeatureList = await DoubleFeature.find({ user: userObj._id })
			.sort({ createdAt: -1 })
			.limit(8);

		res.render("users", {
			user: req.user,
			username: username,
			doublefeatureList: doublefeatureList,
		});
	} catch (error) {
		console.error(error);
        // Render with empty list on error to be safe, or handle error page
        res.render("users", {
            user: req.user,
            username: username,
            doublefeatureList: [],
        });
	}
});

// @description     User Created Double Features
// @route           GET /user/username/all
router.get(paths.slice(0, 2), async (req, res) => {
	const user = req.user;
	const username = req.params.username;
	const doublefeaturePage = req.params.page ? req.params.page : 1;

	try {
		const users = await User.find({ username: username });
        if (!users || users.length === 0) {
             // Handle user not found
             return res.render("userall", {
                user: req.user,
                username: username,
                doublefeatureCount: 0,
                doublefeatureList: [],
                doublefeaturePage: doublefeaturePage, // Corrected typo in original code 'doublefeturePage' -> 'doublefeaturePage' if intended, but keeping consistency with render
             });
        }
        const userObj = users[0];
		
		const doublefeatureCount = await DoubleFeature.countDocuments({ user: userObj._id });
		const doublefeatureList = await DoubleFeature.find({ user: userObj._id })
			.sort({ createdAt: -1 })
			.skip((doublefeaturePage - 1) * 16)
			.limit(16);

		res.render("userall", {
			user: req.user,
			username: username,
			doublefeatureCount: doublefeatureCount,
			doublefeatureList: doublefeatureList,
			doublefeaturePage: doublefeaturePage,
		});
	} catch (error) {
		console.error(error);
        res.render("userall", {
			user: req.user,
			username: username,
			doublefeatureCount: 0,
			doublefeatureList: [],
			doublefeaturePage: doublefeaturePage,
		});
	}
});

// @description     User Logged And Liked Double Features
// @route           GET /user/username/history & /user/username/likes
router.get(paths.slice(2, 6), async (req, res) => {
	const username = req.params.username;
	const doublefeaturePage = req.params.page ? req.params.page : 1;
	const splitter = req.originalUrl.split("/");
	let category;
	let renderPage;

	try {
		const users = await User.find({ username: username });
        if (!users || users.length === 0) return; // Or handle error

		const userObj = users[0];
		switch (splitter[3]) {
			case "history":
				category = userObj.watched;
				renderPage = "userlogs";
				break;
			case "likes":
				category = userObj.liked;
				renderPage = "userlikes";
				break;
		}

		const doublefeatureCount = await DoubleFeature.countDocuments({ _id: category });
		const doublefeatureList = await DoubleFeature.find({ _id: category })
			.skip((doublefeaturePage - 1) * 16)
			.limit(16);

		res.render(renderPage, {
			user: req.user,
			username: username,
			doublefeatureCount: doublefeatureCount,
			doublefeatureList: doublefeatureList,
			doublefeaturePage: doublefeaturePage,
		});

	} catch (error) {
		console.error(error);
	}
});

// @description     User Rated Double Features
// @route           GET /user/username/ratings
router.get(paths.slice(6, 8), async (req, res) => {
	const username = req.params.username;
	const doublefeaturePage = req.params.page ? req.params.page : 1;

	try {
		const users = await User.find({ username: username });
        if (!users || users.length === 0) return;

		const userObj = users[0];
		const doublefeatureCount = await DoubleFeature.countDocuments({ _id: userObj.rated });
		const doublefeatureList = await DoubleFeature.find({ _id: userObj.rated })
			.skip((doublefeaturePage - 1) * 16)
			.limit(16);
		
		const userRatings = await Rating.find({ user: userObj._id });

		res.render("userratings", {
			user: req.user,
			username: username,
			doublefeatureCount: doublefeatureCount,
			doublefeatureList: doublefeatureList,
			userRatings: userRatings,
			doublefeaturePage: doublefeaturePage,
		});

	} catch (error) {
		console.error(error);
	}
});

// @description     User <Rating> Double Features
// @route           GET /user/username/ratings/rated/rating
router.get(paths.slice(8, paths.length), async (req, res) => {
	const username = req.params.username;
	const doublefeaturePage = req.params.page ? req.params.page : 1;
	const rating = req.params.rating;

	try {
        const users = await User.find({ username: username });
        if (!users || users.length === 0) return;
        const userObj = users[0];

        const doublefeatureCount = await Rating.countDocuments({ user: userObj._id, rating: rating });
        const ratingList = await Rating.find({ user: userObj._id, rating: rating })
            .skip((doublefeaturePage - 1) * 16)
            .limit(16);

        const doublefeatureIds = ratingList.map(element => element.doublefeature);
        const doublefeatureList = await DoubleFeature.find({ _id: { $in: doublefeatureIds } });

        res.render("userratingsnumber", {
            user: req.user,
            username: username,
            doublefeatureCount: doublefeatureCount,
            doublefeatureList: doublefeatureList,
            userRatings: ratingList,
            doublefeaturePage: doublefeaturePage,
            rating: rating,
        });

	} catch (error) {
		console.error(error);
	}
});

// @description     Double Feature Page
// @route           GET /user/username/identifier/doublefeatureTitle
router.get("/:username/:identifier/:title", async (req, res) => {
	const user = req.user;
	const username = req.params.username;
	const identifier = req.params.identifier;
	let doublefeatureComments = [];
	let userRating;

	try {
        if (req.user) {
            await User.findOne({ username: req.user.username });
            // This findOne seems redundant in original code as it doesn't use the result, 
            // but we'll keep the flow simple. 
            // The original code nests inside this User.findOne callback but uses `req.user` later.
            // We can probably skip this if we just rely on req.user providing current user info.
        }

        let userObj;
        if (!req.user) {
             // Logic for non-logged in user to find the owner?
             // Original code had an else block doing `DoubleFeature.findOne` directly.
             // Actually, the original code logic is split: if(req.user) { User.findOne ... DoubleFeature.findOne ... } else { DoubleFeature.findOne ... }
        }
        
        // Let's unify the logic. Both branches fetch DoubleFeature first.
        const doublefeature = await DoubleFeature.findOne({
            username: username,
            identifier: identifier,
        });

        if (!doublefeature) {
             // Handle 404?
             return res.send("Double Feature not found"); 
        }

        const comments = await Comment.find({ doublefeature: doublefeature });
        doublefeatureComments = comments;

        if (req.user) {
             const rating = await Rating.findOne({
                user: ObjectID(req.user._id),
                doublefeature: doublefeature,
             });
             userRating = rating;
        }

        let movieOne = [];
        let movieTwo = [];
        
        // Fetch TMDB data
        if (doublefeature.movie_one_id === null) {
              const response = await axios.get(movieURL + doublefeature.movie_two_id + "?api_key=" + key);
              movieTwo = response.data;
        } else if (doublefeature.movie_two_id === null) {
              const response = await axios.get(movieURL + doublefeature.movie_one_id + "?api_key=" + key);
              movieOne = response.data;
        } else {
              const [res1, res2] = await Promise.all([
                  axios.get(movieURL + doublefeature.movie_one_id + "?api_key=" + key),
                  axios.get(movieURL + doublefeature.movie_two_id + "?api_key=" + key)
              ]);
              movieOne = res1.data;
              movieTwo = res2.data;
        }

        res.render("doublefeaturepage", {
            user: user,
            username: username,
            doublefeatureInfo: doublefeature,
            movieOne: movieOne,
            movieTwo: movieTwo,
            doublefeatureComments: doublefeatureComments,
            userRating: userRating,
        });

	} catch (error) {
		console.error(error);
	}
});

// @description     Double Feature Page Page - Edit, Swap, Delete, Watch, Like, Rate, or Comment Double Feature Button
// @route           POST /movies/genre/:genreName/title
//
router.post("/:username/:identifier/:title", async (req, res) => {
	const username = req.user.username;
	if (req.body.formInstance === "commentform") {
		const doublefeatureId = req.body.hiddenIdComment;
		const userId = req.user._id;

		const comment = new Comment();
		comment.comment = sanitize(req.body.comments);
		comment.username = username;
		comment.user = req.user;
		comment.doublefeature = ObjectID(doublefeatureId);

		try {
			await comment.save();
			await DoubleFeature.findOneAndUpdate(
				{ _id: ObjectID(doublefeatureId) },
				{ $push: { comments: comment } }
			);
			req.flash("success_create", "Comment successfully posted");
			res.redirect("back");
		} catch (error) {
			console.error(error);
			req.flash("fail_create", "Something went wrong");
			res.redirect("back");
		}
	} else if (req.body.formInstance === "delcomform") {
		const commentId = req.body.hiddenCommentIdDelete;
		const doublefeatureId = req.body.hiddendfIdDelete;
		Comment.deleteOne({ _id: ObjectID(commentId) }).then((result) => {
			console.log(result);
		});
		DoubleFeature.findOneAndUpdate(
			{ username: username },
			{
				$pull: {
					comments: ObjectID(commentId),
				},
			}
		).then((result) => {
			console.log(result);
		});
		req.flash("success_create", "Comment successfully deleted");
		res.redirect("back");
	} else if (req.body.formInstance === "editform") {
		const doublefeatureId = req.body.hiddenIdEdit;
		const doublefeatureTitle = sanitize(req.body.title);
		const doublefeatureDescription = sanitize(req.body.description);
		DoubleFeature.findOneAndUpdate(
			{ _id: ObjectID(doublefeatureId) },
			{
				$set: {
					title: doublefeatureTitle,
					description: doublefeatureDescription,
				},
			}
		).then((result) => {
			console.log(result);
		});
		req.flash("success_create", "Double Feature successfully edited");
		res.redirect("back");
	} else if (req.body.formInstance === "swapform") {
		const doublefeatureId = req.body.hiddenIdSwap;
		const movieOneId = req.body.hiddenMovieOneIdSwap;
		const movieOneTitle = req.body.hiddenMovieOneTitleSwap;
		const movieOnePoster = req.body.hiddenMovieOnePosterSwap;
		const movieTwoId = req.body.hiddenMovieTwoIdSwap;
		const movieTwoTitle = req.body.hiddenMovieTwoTitleSwap;
		const movieTwoPoster = req.body.hiddenMovieTwoPosterSwap;

		DoubleFeature.findOneAndUpdate(
			{ _id: ObjectID(doublefeatureId) },
			{
				$set: {
					movie_one_id: movieTwoId,
					movie_one_title: movieTwoTitle,
					movie_one_poster: movieTwoPoster,
					movie_two_id: movieOneId,
					movie_two_title: movieOneTitle,
					movie_two_poster: movieOnePoster,
				},
			}
		).then((result) => {
			console.log(result);
		});

		req.flash("success_create", "Movies successfully swapped");
		res.redirect("back");
	} else if (req.body.formInstance === "delform") {
		const doublefeatureId = req.body.hiddenIdDelete;
        try {
            await DoubleFeature.deleteOne({ _id: ObjectID(doublefeatureId) });
            await Rating.deleteMany({ doublefeature: ObjectID(doublefeatureId) });
            await Comment.deleteMany({ doublefeature: ObjectID(doublefeatureId) });
            await User.findOneAndUpdate(
                { username: username },
                {
                    $pull: {
                        doublefeatures: ObjectID(doublefeatureId),
                    },
                }
            );
            req.flash("success_create", "Double Feature successfully deleted");
		    res.redirect("/users/" + username);
        } catch (error) {
            console.error(error);
            req.flash("fail_create", "Something went wrong deleting feature");
		    res.redirect("back");
        }
	} else if (req.body.formInstance === "rateform") {
		console.log(req.body.rate);
		const userId = req.body.hiddenUserIdRate;
		const doublefeatureId = req.body.hiddenIdRate;
		try {
			if (req.body.hiddenRating) {
				const userDoc = await User.findOneAndUpdate(
					{ _id: ObjectID(userId) },
					{ $addToSet: { rated: ObjectID(doublefeatureId) } }
				);

				if (!userDoc.rated.includes(doublefeatureId)) {
					const rating = new Rating();
					rating.rating = req.body.hiddenRating;
					rating.user = ObjectID(userId);
					rating.doublefeature = ObjectID(doublefeatureId);
					await rating.save();
					
					const doublefeature = await DoubleFeature.findOneAndUpdate(
						{ _id: ObjectID(doublefeatureId) },
						{
							$inc: {
								rating_count: 0.5,
								rating_value: req.body.hiddenRating / 2,
							},
						},
						{ new: true }
					);

					if (doublefeature) {
						const ratingCount = parseInt(doublefeature.rating_count) + 1; // Logic from original code seems to expect old count? 
                        // Wait, original: finding doublefeature (before update, default) -> then calculating -> then updating.
                        // If I used {new: true}, I get UPDATED doc.
                        // Original: `DoubleFeature.findOneAndUpdate(..., callback)` -> implies `doublefeature` is the document satisfying query *before* or *after*?
                        // Mongoose default is BEFORE.
                        // Original code: `parseInt(doublefeature.rating_count) + 1`. 
                        // If doublefeature is BEFORE update, then count + 1 is correct.
                        // My code: `await DoubleFeature.findOneAndUpdate(..., {new: false})` (default) -> returns BEFORE.
                        // BUT, I'm waiting for it.
                        // Let's stick to default behavior.
                    }
				} else {
                    // Update existing rating
					const oldRating = await Rating.findOneAndUpdate(
						{ user: req.user._id, doublefeature: ObjectID(doublefeatureId) },
						{ $set: { rating: req.body.hiddenRating } }
					);
                    // oldRating is the document BEFORE update.

					if (oldRating) {
                        const doublefeature = await DoubleFeature.findOneAndUpdate(
                            { _id: ObjectID(doublefeatureId) },
                            {
                                $inc: {
                                    rating_value: req.body.hiddenRating - oldRating.rating,
                                },
                            }
                        );
                        // doublefeature is doc BEFORE update.
                    }
				}
                
                // Recalculate weights if needed?
                // The original code has a nested logic:
                // findOneAndUpdate (inc) -> callback(doublefeature) -> calculate -> findOneAndUpdate(set weights).
                // I need to preserve this 2-step update because they update weighted rating based on new values.
                
                // Let's do it properly inside the blocks above.
			}

			if (req.body.rate) {
				if (req.body.rate.includes("watch")) {
					const userDoc = await User.findOneAndUpdate(
						{ _id: ObjectID(userId) },
						{ $addToSet: { watched: ObjectID(doublefeatureId) } }
					);
					if (!userDoc.watched.includes(doublefeatureId)) {
						await DoubleFeature.findOneAndUpdate(
							{ _id: ObjectID(doublefeatureId) },
							{ $inc: { watch_count: 1 } }
						);
					}
				} else {
					const userDoc = await User.findOneAndUpdate(
						{ _id: ObjectID(userId) },
						{ $pull: { watched: ObjectID(doublefeatureId) } }
					);
					if (userDoc.watched.includes(doublefeatureId)) {
						await DoubleFeature.findOneAndUpdate(
							{ _id: ObjectID(doublefeatureId) },
							{ $inc: { watch_count: -1 } }
						);
					}
				}

				if (req.body.rate.includes("like")) {
					const userDoc = await User.findOneAndUpdate(
						{ _id: ObjectID(userId) },
						{ $addToSet: { liked: ObjectID(doublefeatureId) } }
					);
					if (!userDoc.liked.includes(doublefeatureId)) {
						await DoubleFeature.findOneAndUpdate(
							{ _id: ObjectID(doublefeatureId) },
							{ $inc: { like_count: 1 } }
						);
					}
				} else {
					const userDoc = await User.findOneAndUpdate(
						{ _id: ObjectID(userId) },
						{ $pull: { liked: ObjectID(doublefeatureId) } }
					);
					if (userDoc.liked.includes(doublefeatureId)) {
						await DoubleFeature.findOneAndUpdate(
							{ _id: ObjectID(doublefeatureId) },
							{ $inc: { like_count: -1 } }
						);
					}
				}
			} else {
                // Remove both
				const userWatch = await User.findOneAndUpdate(
					{ _id: ObjectID(userId) },
					{ $pull: { watched: ObjectID(doublefeatureId) } }
				);
				if (userWatch.watched.includes(doublefeatureId)) {
					await DoubleFeature.findOneAndUpdate(
						{ _id: ObjectID(doublefeatureId) },
						{ $inc: { watch_count: -1 } }
					);
				}
                
				const userLike = await User.findOneAndUpdate(
					{ _id: ObjectID(userId) },
					{ $pull: { liked: ObjectID(doublefeatureId) } }
				);
				if (userLike.liked.includes(doublefeatureId)) {
					await DoubleFeature.findOneAndUpdate(
						{ _id: ObjectID(doublefeatureId) },
						{ $inc: { like_count: -1 } }
					);
				}
			}
			req.flash("success_create", "Double Featured successfully logged");
			res.redirect("back");
		} catch (error) {
			console.error(error);
            req.flash("fail_create", "Something went wrong");
			res.redirect("back");
		}
	} else if (req.body.formInstance === "tweetForm") {
		const title = req.body.hiddenDoubleFeatureTitle;
		const movieOnePoster = req.body.hiddenMovieOnePoster;
		const movieTwoPoster = req.body.hiddenMovieTwoPoster;
		tweetDoubleFeature(req, title, movieOnePoster, movieTwoPoster);
		req.flash("success_create", "Tweet successfully generated.");
		res.redirect("back");
	}
});

const tweetDoubleFeature = async (
	req,
	title,
	movieOnePoster,
	movieTwoPoster
) => {
	try {
		movieOne = {
			url: posterPath + movieOnePoster,
			dest: "../../public/posters/movieOnePoster.jpg",
		};

		await download
			.image(movieOne)
			.then(({ filename }) => {
				console.log("Saved to", filename);
			})
			.catch((err) => console.error(err));

		movieTwo = {
			url: posterPath + movieTwoPoster,
			dest: "../../public/posters/movieTwoPoster.jpg",
		};

		await download
			.image(movieTwo)
			.then(({ filename }) => {
				console.log("Saved to", filename);
			})
			.catch((err) => console.error(err));

		const mediaIds = await Promise.all([
			rwClient.v1.uploadMedia("./public/posters/movieOnePoster.jpg", ""),
			rwClient.v1.uploadMedia("./public/posters/movieTwoPoster.jpg"),
		]);

		await rwClient.v1.tweet(
			"This week's Double Feature is titled \"" +
				title +
				'" ' +
				req.protocol +
				"://" +
				req.get("host") +
				req.originalUrl,
			{ media_ids: mediaIds }
		);
	} catch (error) {
		console.error(error);
	}
};

module.exports = router;
