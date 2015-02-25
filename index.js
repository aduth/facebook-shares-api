var http = require( 'http' ),
	url = require( 'url' ),
	pick = require( 'lodash/object/pick' ),
	Queue = require( './queue' ),
	config = require( './config' ),
	queue, server, sendResponse;

if ( ! config.facebook.clientId || ! config.facebook.clientSecret ) {
	throw new Error( 'Could not find APP_FACEBOOK_CLIENT_ID or APP_FACEBOOK_CLIENT_SECRET in environment variables' );
}

queue = new Queue( {
	token: config.facebook.clientId + '|' + config.facebook.clientSecret,
	delay: config.facebook.requestDelay,
	maxQueue: config.facebook.maxQueue
} );

sendResponse = function( body, res ) {
	res.writeHead( 200 );
	res.write( JSON.stringify( body ) );
	res.end();
};

server = http.createServer( function( req, res ) {
	var query = url.parse( req.url, true ).query,
		urls;

	if ( ! query.url ) {
		return sendResponse( {}, res );
	}

	urls = query.url;
	queue.add( urls );
	queue.once( 'process', function( body ) {
		sendResponse( pick( body, urls ), res );
	} );
} );

server.listen( config.port );
console.log( 'Listening on port %d...', config.port );