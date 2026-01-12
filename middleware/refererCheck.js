const allowedDomains = [
    'www.doublefeature.watch',
    'doublefeature.watch',
    'localhost',
    '127.0.0.1'
];

module.exports = (req, res, next) => {
    const referer = req.get('Referer');

    // Allow if no referer (direct access, bookmarks, etc.)
    if (!referer) {
        return next();
    }

    try {
        const refererUrl = new URL(referer);
        if (allowedDomains.some(domain => refererUrl.hostname === domain || refererUrl.hostname.endsWith('.' + domain))) {
            return next();
        }
    } catch (err) {
        console.error('Invalid Referer URL:', referer);
    }

    // Block otherwise
    console.log(`Blocked request with Referer: ${referer}`);
    res.status(403).send('Access denied');
};
