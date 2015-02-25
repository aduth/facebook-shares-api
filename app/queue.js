var EventEmitter = require( 'events' ).EventEmitter,
	request = require( 'request' ),
	assign = require( 'lodash/object/assign' ),
	Queue;

Queue = module.exports = function( options ) {
	this.options = assign( {}, Queue.defaultOptions, options );
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
		this.emit( 'process', body );
		this.processing = false;
		this.lastProcess = Date.now();
	}.bind( this ) );
};