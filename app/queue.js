var EventEmitter = require( 'events' ).EventEmitter,
	request = require( 'request' ),
	defaults = require( 'lodash/object/defaults' ),
	mapValues = require( 'lodash/object/mapValues' ),
	Queue;

Queue = module.exports = function( options ) {
	this.options = defaults( {}, options, Queue.defaultOptions );
	this.queue = [];
	this.lastProcess = 0;
};

Queue.baseUrl = 'https://graph.facebook.com/v2.2/';

Queue.defaultOptions = {
	delay: 1000,
	maxQueue: 50
};

Queue.prototype = Object.create( EventEmitter.prototype );

Queue.prototype.add = function( url ) {
	this.queue = this.queue.concat( url );

	if ( Date.now() - this.lastProcess > this.options.delay ) {
		this.process();
	} else if ( ! this.processing && ! this.timeoutId ) {
		this.timeoutId = setTimeout(
			this.process.bind( this ),
			this.options.delay - ( Date.now() - this.lastProcess )
		);
	}
};

Queue.prototype.process = function() {
	delete this.timeoutId;

	var urls = this.queue.slice( 0, this.options.maxQueue ).map( function( url ) {
		return encodeURIComponent( url );
	} ).join();

	if ( ! urls.length ) {
		return;
	}

	this.queue = [];
	this.processing = true;
	request.get( {
		url: Queue.baseUrl + '?ids=' + urls + '&access_token=' + this.options.token,
		json: true
	}, function( err, res, body ) {
		var values;
		if ( ! err && body ) {
			values = mapValues( body, function( detail ) {
				return detail.share ? detail.share.share_count : null;
			} );
		}

		this.emit( 'process', values );
		this.processing = false;
		this.lastProcess = Date.now();
	}.bind( this ) );
};