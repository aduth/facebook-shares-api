var defaults = require( 'lodash/object/defaults' ),
	url = require( 'url' ),
	redis = require( 'redis' ),
	async = require( 'async' ),
	Cache;

Cache = module.exports = function( options ) {
	var redisDetails;

	this.options = defaults( {}, options, Cache.defaultOptions );

	if ( this.options.queue ) {
		this.options.queue.on( 'process', this.setMany.bind( this ) );
	}

	if ( this.options.redis.url ) {
		redisDetails = url.parse( this.options.redis.url );
		this.client = redis.createClient( redisDetails.port, redisDetails.hostname );

		if ( redisDetails.auth ) {
			this.client.auth( redisDetails.auth.split( ':' )[1] );
		}
	}
};

Cache.defaultOptions = {
	expire: 30000,
	redis: {}
};

Cache.prototype.set = function( key, value, callback ) {
	if ( this.client ) {
		this.client.set( key, value, callback );
		this.client.expire( key, this.options.expire / 1000 );		
	} else if ( callback ) {
		callback();
	}
};

Cache.prototype.setMany = function( object, callback ) {
	async.parallel( Object.keys( object ).map( function( key ) {
		return this.set( key, object[ key ] );
	}.bind( this ) ), callback );
};

Cache.prototype.get = function( key, callback ) {
	if ( ! callback ) {
		return;
	}

	if ( ! this.client ) {
		return callback();
	}

	this.client.get( key, function( err, value ) {
		if ( value ) {
			value = parseInt( value, 10 );
		}

		callback( err, value );
	} );
};