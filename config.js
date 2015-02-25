module.exports = {
	port: process.env.PORT || 8000,
	facebook: {
		clientId: process.env.FACEBOOK_CLIENT_ID,
		clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
		requestDelay: process.env.FACEBOOK_REQUEST_DELAY,
		maxQueue: process.env.FACEBOOK_MAX_QUEUE
	},
	redis: {
		url: process.env.REDIS_URL || process.env.REDISTOGO_URL
	},
	cache: {
		expire: process.env.CACHE_EXPIRE
	}
};