var http = require( 'http' ),
	url = require( 'url' ),
	async = require( 'async' ),
	pick = require( 'lodash/object/pick' ),
	without = require( 'lodash/array/without' ),
	assign = require( 'lodash/object/assign' ),
	sendResponse;

sendResponse = function( body, res ) {
	res.writeHead( 200 );
	res.write( JSON.stringify( body ) );
	res.end();
};

module.exports = function( queue, cache ) {
	return http.createServer( function( req, res ) {
		var query = url.parse( req.url, true ).query,
			urls;

		if ( ! query.url ) {
			return sendResponse( {}, res );
		}

		urls = Array.isArray( query.url ) ? query.url : [ query.url ];

		async.waterfall( [
			function( asyncNext ) {
				async.reduce( urls, {}, function( memo, item, callback ) {
					// Attempt to find each of the requested URLs in the cache
					cache.get( item, function( err, value ) {
						if ( value ) {
							memo[ item ] = value;
						}

						callback( err, memo );
					} );
				}, asyncNext );
			},
			function( data, asyncNext ) {
				// It's not guaranteed that all URLs exist in the cache, so
				// determine which have not yet been retrieved
				var remainingUrls = without.apply( without, [ urls ].concat( Object.keys( data ) ) );
				if ( ! remainingUrls.length ) {
					return asyncNext( null, data );
				}

				// Add remaining URLs to the queue and wait for the next
				// processing tick
				queue.add( remainingUrls );
				queue.once( 'process', function( body ) {
					assign( data, pick( body, remainingUrls ) );
					asyncNext( null, data );
				} );
			}
		], function( err, result ) {
			sendResponse( err ? {} : result, res );
		} );
	} );
};