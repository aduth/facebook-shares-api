var http = require( 'http' ),
	url = require( 'url' ),
	pick = require( 'lodash/object/pick' ),
	sendResponse;

sendResponse = function( body, res ) {
	res.writeHead( 200 );
	res.write( JSON.stringify( body ) );
	res.end();
};

module.exports = function( queue ) {
	return http.createServer( function( req, res ) {
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
};