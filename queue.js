var EventEmitter = require( 'events' ).EventEmitter,
	request = require( 'request' );

var Queue = module.exports = function( token ) {
	this.token = token;
	this.queue = [];
	this.lastProcess = 0;
};

Queue.baseUrl = 'https://graph.facebook.com/v2.2/';
Queue.delay = 1000;

Queue.prototype = Object.create( EventEmitter.prototype );

Queue.prototype.add = function( url ) {
	this.queue = this.queue.concat( url );

	if ( Date.now() - this.lastProcess > Queue.delay ) {
		this.process();
	} else if ( ! this.processing && ! this.timeoutId ) {
		this.timeoutId = setTimeout(
			this.process.bind( this ),
			Queue.delay - ( Date.now() - this.lastProcess )
		);
	}
};

Queue.prototype.process = function() {
	delete this.timeoutId;
	this.processing = true;

	var query = this.queue.map( function( url ) {
		return 'ids=' + url;
	} ).join( '&' );

	if ( ! query.length ) {
		return;
	}

	request.get( {
		url: Queue.baseUrl + '?' + query + '&access_token=' + this.token,
		json: true
	}, function( err, res, body ) {
		this.emit( 'process', body );
		this.queue = [];
		this.processing = false;
		this.lastProcess = Date.now();
	}.bind( this ) );
};