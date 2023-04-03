const express = require('express');

// Instance of Router
const router = express.Router();

// @description     Landing page
// @route           GET /
router.get('/', (req, res) => {
	const user = req.user;
	res.render('landing', {
		'user': user
	});
});

module.exports = router;
