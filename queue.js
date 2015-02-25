var EventEmitter = require( 'events' ).EventEmitter,
	request = require( 'request' );

var Queue = module.exports = function( token, delay ) {
	this.token = token;
	this.queue = [];
	this.lastProcess = 0;
	this.delay = delay || 1000;
};

Queue.baseUrl = 'https://graph.facebook.com/v2.2/';

Queue.prototype = Object.create( EventEmitter.prototype );

Queue.prototype.add = function( url ) {
	this.queue = this.queue.concat( url );

	if ( Date.now() - this.lastProcess > this.delay ) {
		this.process();
	} else if ( ! this.processing && ! this.timeoutId ) {
		this.timeoutId = setTimeout(
			this.process.bind( this ),
			this.delay - ( Date.now() - this.lastProcess )
		);
	}
};

Queue.prototype.process = function() {
	delete this.timeoutId;

	var urls = this.queue.map( function( url ) {
		return encodeURIComponent( url );
	} ).join();

	if ( ! urls.length ) {
		return;
	}

	this.processing = true;
	request.get( {
		url: Queue.baseUrl + '?ids=' + urls + '&access_token=' + this.token,
		json: true
	}, function( err, res, body ) {
		this.emit( 'process', body );
		this.queue = [];
		this.processing = false;
		this.lastProcess = Date.now();
	}.bind( this ) );
};