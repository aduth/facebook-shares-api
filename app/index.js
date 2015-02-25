var Queue = require( './queue' ),
	config = require( '../config' ),
	queue, server;

if ( ! config.facebook.clientId || ! config.facebook.clientSecret ) {
	throw new Error( 'Could not find APP_FACEBOOK_CLIENT_ID or APP_FACEBOOK_CLIENT_SECRET in environment variables' );
}

queue = new Queue( {
	token: config.facebook.clientId + '|' + config.facebook.clientSecret,
	delay: config.facebook.requestDelay,
	maxQueue: config.facebook.maxQueue
} );

server = require( './server' )( queue );
server.listen( config.port );
console.log( 'Listening on port %d...', config.port );