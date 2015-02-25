module.exports = {
	port: process.env.PORT || 8000,
	facebook: {
		clientId: process.env.FACEBOOK_CLIENT_ID,
		clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
		requestDelay: process.env.FACEBOOK_REQUEST_DELAY
	}
};