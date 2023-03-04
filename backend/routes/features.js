const axios = require('axios');
const express = require('express');
const sanitize = require('mongo-sanitize');

// Instance of Router
const router = express.Router();

// Models
const User = require('../models/User');
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
router.get(paths.slice(2, paths.length), (req, res) => {
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
	DoubleFeature.countDocuments(
		{
			createdAt: { $gte: new Date(new Date() - days * 60 * 60 * 24 * 1000) }
		},
		function (error, count) {
			if (error) {
				console.error(error);
			} else {
				const doublefeatureCount = count;
				DoubleFeature.find( 
					{
						createdAt: { $gte: new Date(new Date() - days * 60 * 60 * 24 * 1000) }
					},
					function(error, doublefeatureData) {
						if (error) {
							console.error(error);
						} else {
							res.render('features', {
								'user': user,
								'doublefeatureData': doublefeatureData,
								'doublefeatureCount': doublefeatureCount,
								'doublefeaturePage': doublefeaturePage,
								'sortedBy': sortedBy
							});
						}
					}
				).sort( { rating_weighted: -1 } ).skip((doublefeaturePage - 1) * 16).limit(16);
			}
		}
	);
});

// @description     Popular Double Features of All Time Page
// @route           GET /features/popular
router.get(paths.slice(0, 2), (req, res) => {
	const user = req.user;
	const doublefeaturePage = (req.params.page) ? req.params.page : 1;
	const sortedBy = '';
	DoubleFeature.countDocuments(function (error, count) {
		if (error) {
			console.error(error);
		} else {
			const doublefeatureCount = count;
			DoubleFeature.find( 
				{
					$query: {}
				},
				function(error, doublefeatureData) {
					if (error) {
						console.error(error);
					} else {
						res.render('features', {
							'user': user,
							'doublefeatureData': doublefeatureData,
							'doublefeatureCount': doublefeatureCount,
							'doublefeaturePage': doublefeaturePage,
							'sortedBy': sortedBy
						});
					}
				}
			).sort( { rating_weighted: -1 } ).skip((doublefeaturePage - 1) * 16).limit(16);
		}
	});
});

module.exports = router;
