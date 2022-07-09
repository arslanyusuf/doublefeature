const TwitterApi = require("twitter-api-v2").default;

const client = new TwitterApi({
	appKey: process.env.TWITTER_API_KEY,
	appSecret: process.env.TWITTER_API_KEY_SECRET,
	accessToken: process.env.DOUBLEFEATURE_ACCESS_TOKEN,
	accessSecret: process.env.DOUBLEFEATURE_ACCESS_TOKEN_SECRET,
});

const rwClient = client.readWrite;

module.exports = rwClient;
