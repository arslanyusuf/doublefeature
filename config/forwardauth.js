module.exports = {
	ensureAuthenticated: (req, res, next) => {
		if (req.isAuthenticated()) {
			return next();
		}
		req.flash('error_msg', 'Please log in to view that resource');
		res.redirect('/auth/signin');
	},

	forwardAuthenticated: (req, res, next) => {
		if (!req.isAuthenticated()) {
			return next;
		}
		res.redirect('/users/' + req.body.username);
	}
};
