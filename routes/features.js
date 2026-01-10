const express = require('express');

// Instance of Router
const router = express.Router();

// Models
const DoubleFeature = require('../models/DoubleFeature');

// Paths
const paths = [ '/popular',
				'/popular/:page',
				'/popular/year',
				'/popular/year/:page',
				'/popular/month',
				'/popular/month/:page',
				'/popular/week',
				'/popular/week/:page'
			  ];

// @description     Popular Double Features of This Year, Month, Week
// @route           GET /features/popular/year
router.get(paths.slice(2, paths.length), async (req, res) => {
	const user = req.user;
	const doublefeaturePage = (req.params.page) ? req.params.page : 1;
	const splitter = req.originalUrl.split('/');
	const sortedBy = splitter[3];
	let days;
	switch (sortedBy) {
		case 'year':
			days = 365;
			break;
		case 'month':
			days = 30;
			break;
		case 'week':
			days = 7;
			break;
	}

	try {
		const query = { createdAt: { $gte: new Date(new Date() - days * 60 * 60 * 24 * 1000) } };
		const count = await DoubleFeature.countDocuments(query);
		const doublefeatureData = await DoubleFeature.find(query)
			.sort( { rating_weighted: -1 } )
			.skip((doublefeaturePage - 1) * 16)
			.limit(16);

		res.render('features', {
			'user': user,
			'doublefeatureData': doublefeatureData,
			'doublefeatureCount': count,
			'doublefeaturePage': doublefeaturePage,
			'sortedBy': sortedBy
		});
	} catch (error) {
		console.error(error);
	}
});

// @description     Popular Double Features of All Time Page
// @route           GET /features/popular
router.get(paths.slice(0, 2), async (req, res) => {
	const user = req.user;
	const doublefeaturePage = (req.params.page) ? req.params.page : 1;
	const sortedBy = '';

	try {
		const count = await DoubleFeature.countDocuments();
		const doublefeatureData = await DoubleFeature.find({})
			.sort( { rating_weighted: -1 } )
			.skip((doublefeaturePage - 1) * 16)
			.limit(16);

		res.render('features', {
			'user': user,
			'doublefeatureData': doublefeatureData,
			'doublefeatureCount': count,
			'doublefeaturePage': doublefeaturePage,
			'sortedBy': sortedBy
		});
	} catch (error) {
		console.error(error);
	}
});

module.exports = router;
