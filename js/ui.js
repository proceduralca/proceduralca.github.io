function Ui( url ) {

	const scope = this;

	this.renderer = document.createElement('canvas');
	this.renderer.style.zIndex += 999;
	this.renderer.style.opacity = 0;

	document.body.appendChild( this.renderer );

	const context = this.renderer.getContext('2d');
	this.context = context;
	const bitmap = document.createElement('img');
	bitmap.src = url;

	const buffer = document.createElement('canvas');

	this.onload = function(){};

	const font = document.createElement('canvas');
	const filter = font.getContext('2d');

	// Renderer parameters.

	this.scale = 1;

	// Navigation parameters.

	this.w = 10;
	this.h = 24;

	scope.set = function( w, h ){

		scope.w = w;
		scope.h = h;
		scope.style.w = scope.w;
		scope.style.h = scope.h;

	};

	// Text style parameters.

	this.style = {

		w:			scope.w,		// Character width unit
		h:			scope.h,		// Character height unit
		margin:		1,				// Default edge margin
		wrap:		0,				// wrap character length
		color:		'#fff',			// Text color
		opacity:	1,				// Text opacity
		cursor:		{ col: 0, row: 0 },	// Cursor position
		offset:		{ x: 0, y: 0 },		// Offset in px
		area:		{ x: 0, y: 0, width: 0, height: 0 },	// Text area position and size in px
		active:		false,	// Active on renderer
		timeout:	0,		// Timeout 
		position:	'relative'	// Renderered text position type

	} 

	// Global style parameters.

	this.color = '#fff'; 

	// Text area parameters.

	this.WRAP = false;
	this.wrap = 0;

	// Font sprite sheet parameters.

	this.sheet = {

		x: 32,
		y: 64,
		width: 16,	// Tile width
		height: 16	// Tile height

	};

	// Redraw parameters.

	this.REDRAW = false;

	let redraw	= [];
	let links	= [];
	scope.queue	= [];
	let ids = 0;

	// Position history.

	this.last = {

		x: 0,
		y: 0,
		width: 0,
		height: 0,
		cursor: { x: 0, y: 0 }
	
	}

	// Animation parameters.

	this.WRITE = false;

	let TIMER = 0;
	let QUEUE = false;
	let TIMEOUT = 12;
	this.timeout = 20;
	let timeoutId = 0;

	// Generate sprite sheet

	bitmap.onload = function() {

		font.width	= bitmap.width - scope.sheet.x;
		font.height = bitmap.height - scope.sheet.y;

		// Copy font image to new canvas.

		filter.drawImage(

			bitmap,
			scope.sheet.x,
			scope.sheet.y,
			font.width,
			font.height,
			0,
			0,
			font.width,
			font.height

		);

		scope.renderer.style.opacity = 1;
		
		// Fire callback function when image loaded.

		scope.onload()

	};

	// Resize

	this.render = function(){

		if( scope.queue.length > 0 && !QUEUE ) {

			if( TIMER % TIMEOUT == 0 ){

				scope.queue[0]()
				scope.queue.shift()

			}

			TIMER++

		}
		else{

			let ctx = buffer.getContext('2d');
			ctx.drawImage( scope.renderer, 0, 0 );
			TIMER = 0;

		}

	}

	this.resize = function( _width, _height ) {

		width = ( _width === undefined ) ? window.innerWidth : _width;
		height = ( _height === undefined ) ? window.innerHeight : _height;


		// Round the devicePixelRatio and resize the viewport to prevent sub-pixel rendering.

		let meta = document.querySelector("meta[name=viewport]")
		let viewport = (1 / window.devicePixelRatio) * Math.round( window.devicePixelRatio );

		meta.setAttribute(
		'content', 'width=device-width, initial-scale=' + viewport + ',maximum-scale=1.0, user-scalable=0'
		);

		// Create scaled width & height targets.
		this.renderer.width = width;
		this.renderer.height = height;
		
 		scope.width		= scope.renderer.width / scope.scale;
 		scope.height	= scope.renderer.height / scope.scale;

		// Scale the context & disable smoothing.

		context.scale( scope.scale, scope.scale );
		context.imageSmoothingEnabled = false;

		// Reset history for redrawing.

		scope.last.x = 0;
		scope.last.y = 0;
		scope.last.width = 0;
		scope.last.height = 0;

		// Redraw based on resize updates.

		// Flag REDRAW to prevent buffers from being cleared.

		scope.REDRAW = true;

			scope.clear();

			for (let i in redraw) {

				redraw[i]();

			}

		scope.REDRAW = false;

	};

	this.redraw = function(){

		scope.REDRAW = true;

			for (let i in redraw) {

				redraw[i]();

			}

		scope.REDRAW = false;

	}

	// Clear renderer or selected area.

	this.clear = function( x, y, w, h ) {

		TIMER = 0;
		window.clearTimeout( timeoutId );

		x = (x === undefined) ? x = 0 : x = x * scope.char.width;
		y = (y === undefined) ? y = 0 : y = y * scope.char.height;
		w = (w === undefined) ? w = scope.renderer.width : w = w * scope.char.width;
		h = (h === undefined) ? h = scope.renderer.height : h = h * scope.char.height;

		context.clearRect(x, y, w, h);

		if (!scope.REDRAW) {

			redraw = []

			for (let i = 0; i < links.length; i++) {

				document.body.removeChild(links[i])

			};

			links = []

		};

		scope.queue = []

	};

	scope.buffer = function(){

		context.drawImage( buffer, 0, 0 );

	}

	// Prints text instantly to the renderer.

	this.print = function( str, col, row, wrap, _style = scope.style ) {

		if( typeof _style !== 'Object' ){}

		scope.style.color = scope.color;
		scope.style.w = scope.w;
		scope.style.h = scope.h;

		let style = Object.assign( {}, scope.style, _style );
					
		if (!scope.REDRAW) {

			redraw.push( function() {

				return new function() {

					scope.print( str, col, row, wrap, style );

				};

			});

		};

		const compute = scope.compute( col, row, wrap, style );

		const _col	= compute.col;
		const _row	= compute.row;
		const _wrap = compute.wrap;

		let cursor = { col: 0, row: 0 };

		for (let i = 0; i < str.length; i++) {

			let w = cursor.col * scope.w;
			let h = cursor.row * scope.h;

			scope.softwrap( str.substring(i), _col + w, _wrap + _col, cursor );

		};

		const funct = function(){

			return function(){

				const c = _col;
				const r = _row;
				const wr = _wrap;

				let cursor = { col: 0, row: 0 };

				for (let i = 0; i < str.length; i++) {

					let w = cursor.col * style.w;
					let h = cursor.row * style.h;

					scope.softwrap( str.substring(i), _col + w, _wrap + _col, cursor );
					scope.encode( str.charAt(i), _col + ( w ), _row + ( h ), style );

				};

			};

		}

		scope.queue.push( funct() );

// 		if ( style.position === 'relative' ){

			scope.last.x		= _col;
			scope.last.y		= _row
			scope.last.width	= _col + _wrap
			scope.last.height	= _row + ( cursor.row ) * scope.h
			scope.last.cursor	= cursor;
			
// 		}

		scope.cursor = cursor;
		
	};

	this.write = function( str, col, row, wrap, style ){

	}


	this.softwrap = function(str, col, wrap, cursor ) {

		let count = 0;

		if (str.charAt(0) === ' ') {

			let r = 0;

			while ( r < str.length - 1 && str.charAt(r + 1) !== ' ' ) {

				count++;
				r++;

			};

		};

		if ( col + count*scope.w > wrap ) {

		// DISABLE SOFTWRAPPING TEMPORARILY
		
// 			cursor.col = 0;
// 			cursor.row ++;

			cursor.col++;

		}
		else {

			cursor.col++;

		};

	};

	// Generates sprite for input character.

	this.encode = function( char, x, y, style ) {

		let n = char.charCodeAt(0);

		let w = style.w;
		let h = style.h;

		let sx = (n % 256) * 16;
		let sy = Math.floor(n / 256) * 16;

		context.beginPath();
		context.clearRect(x, y, w, h);
		context.drawImage(font, sx, sy, 16, 16, x, y, 16, 16);

		// Fill text by overlaying a color.

		context.globalCompositeOperation = 'source-atop';
		context.fillStyle = style.color;
		context.fillRect(x, y, w, 16);
		context.globalCompositeOperation = 'source-over';

		context.closePath()

	};

	this.compute = function( col, row, wrap, style ){

		let _col	= scope.compile(

			col,
			scope.width / scope.scale,
			style.w,
			scope.last.x,
			scope.last.width,
			scope.last.cursor.col

		);

		let _row	= scope.compile(

			row,
			scope.height / scope.scale,
			style.h,
			scope.last.y,
			scope.last.height,
			scope.last.cursor.row

		);

		let _wrap	= scope.compile(

			wrap,
			scope.width / scope.scale ,
			style.w,
			scope.last.width,
			scope.last.width,
			scope.last.width,

		);

		_wrap = ( _col + _wrap > scope.width - _col ) ? scope.width - _col : _wrap;

		return { col: _col, row: _row, wrap: _wrap }

	}

	this.compile = function( input, range, size, relative, last, cursor ){

		let out = 0;

		switch( typeof input ){

			case('number'):
				
				out = input;

			break;

			case( 'function' ):

				out = input();

			break;

			case('string'):

				let sign = 0;

				for( let i = 0; i < input.length; i++ ){

					let char = input.charAt( i );

					switch( char ){

						case( ' ' ):

							// Ignore

						break;

						case( '+' ):

							sign = 1;

							if( i === 0 ){

								out = last;
								 
							}

						break;

						case( '-' ):

							sign = -1;

							if( i === 0 ){

								out = relative;
								 
							}

						break;

						default:

							let val = '';
							let float = false;

							let c = input.charAt( i );

							while( c !== ' ' && c !== '+' && c !== '-' && i < input.length ){

								if( c === '.' ){

									float = true;

								}

								val += c;
								i++;
								c = input.charAt( i );

							};

							i--;

							let n = Number( val )
							n = ( Number.isInteger( n ) && !float )
							? val * size
							: Math.round( range * val );

							if( n === 0 && sign > 0 && i === 1 ){

 								out = relative + cursor * size;

							} else if( n === 0 && sign < 0 && i == 1 ){

								out = relative;

							} else if( sign === 0 ){

								out = n;
								
							}
							else{

								out += n * sign;

							}

							sign = 0;
							val = ''
			
					};


				};

			break;

		}

		return out;

	}

};