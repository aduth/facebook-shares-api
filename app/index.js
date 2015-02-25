var Queue = require( './queue' ),
	Cache = require( './cache' ),
	config = require( '../config' ),
	queue, cache, server;

if ( ! config.facebook.clientId || ! config.facebook.clientSecret ) {
	throw new Error( 'Could not find APP_FACEBOOK_CLIENT_ID or APP_FACEBOOK_CLIENT_SECRET in environment variables' );
}

queue = new Queue( {
	token: config.facebook.clientId + '|' + config.facebook.clientSecret,
	delay: config.facebook.requestDelay,
	maxQueue: config.facebook.maxQueue
} );

cache = new Cache( {
	queue: queue,
	expire: config.cache.expire,
	redis: config.redis
} );

server = require( './server' )( queue, cache );
server.listen( config.port );
console.log( 'Listening on port %d...', config.port );