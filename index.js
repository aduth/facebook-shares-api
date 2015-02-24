var http = require( 'http' ),
	url = require( 'url' ),
	Queue = require( './queue' ),
	pick = require( 'lodash/object/pick' ),
	queue, server, sendResponse;

if ( ! process.env.APP_FACEBOOK_CLIENT_ID || ! process.env.APP_FACEBOOK_CLIENT_SECRET ) {
	throw new Error( 'Could not find APP_FACEBOOK_CLIENT_ID or APP_FACEBOOK_CLIENT_SECRET in environment variables' );
}

queue = new Queue( process.env.APP_FACEBOOK_CLIENT_ID + '|' + process.env.APP_FACEBOOK_CLIENT_SECRET );

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

server.listen( process.env.APP_PORT || 8000 );