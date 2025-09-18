/**
 * Page flip component based on Slick slider component
 */
App.SlickFlip = function ()
{
	var myId,  myComp;
	var initialized = false;
	var listener = undefined;
	// config params
	var fade, speed;
		
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * cls: class name for div style
	 * fade: true/false to fade or slide
	 * speed: number is transition speed
	 * 
	 */  
	this.createUI = function ( listObj, allConfig )
	{
		myId = this.compId;
		myComp = this;

		// use passed name if any
		if ( listObj.name ) {
			myId = listObj.name;
		}
		
		// get listener if available, save it
		if ( listObj.config.listener ) {
			listener = listObj.config.listener;
		}
		
		// get passed css class (if any)
		var cls = SA.getConfig (listObj, 'cls', '');
		
		// get other config params
		fade = SA.getConfig (listObj, 'fade', false );
		speed = SA.getConfig ( listObj, 'speed', 200 );
		
		// gen html
		var html = '<div id="' + myId + '" class="' + cls + '" />';
		return html;
	}
	
	/**
	 * Reset carousel (remove at index 0 for now)
	 */
	this.reset = function ()
	{
		var $sdiv = $( '#' + myId);		
		$sdiv.slick ( 'slickRemove', 0 );
	}
	
	/**
	 * Get current page index
	 */
	this.curPageIdx = function ()
	{
		var curIdx = $( '#' + myId).slick('slickCurrentSlide');
		return curIdx;
	}
	
	/**
	 * Show specific page index
	 */
	this.showPageIdx = function ( pageIdx )
	{
		$( '#' + myId).slick ('slickGoTo', pageIdx );
	}
	
	/**
	 * Show next page 
	 */
	this.showNext = function ()
	{
		$( '#' + myId).slick ( 'slickNext' );
	}
	
	/**
	 * Shows previous page
	 */
	this.showPrev = function ()
	{
		var $div = $( '#' + myId);
		
		var curIdx = $div.slick('slickCurrentSlide');
		
		if ( curIdx > 0 ) {
			$div.slick ( 'slickPrev' );
		}
		
		// notify about the show next event
		if ( listener )
			listener.actionPerformed ( {cmd:'showPrev', curIdx:curIdx-1} );
	}
	
	/**
	 * Show next page html and show it 
	 */
	this.setNextPage = function ( pageHtml ) 
	{
		var $div = $( '#' + myId);		
		$div.slick ( 'slickAdd', pageHtml );
		$('#page').animate({scrollTop: 0}, 0);
		
		$div.slick ( 'slickNext' );
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created)
	 */ 
	this.postLoad = function ()
	{
		var $sdiv = $( '#' + myId );
		
		if ( !initialized ) {
			initialized = true;
			
			$sdiv.slick ({
				infinite: true,
				speed: speed,
				infinite: false,
				fade: fade,
				cssEase: 'linear',
				arrows: false,
				autoplay: false});
			
			$sdiv.on('afterChange', function(event, slick, direction) {
				var curIdx = $sdiv.slick('slickCurrentSlide');
				if ( curIdx >= 0 ) {
					$sdiv.slick ( 'slickRemove', curIdx+1 );
				}
			});
			
			$sdiv.on('swipe', function(event, slick, direction) {
				if ( listener ) {
					var idx = $( '#' + myId).slick('slickCurrentSlide');
					listener.actionPerformed ( {cmd:'showNext', curIdx:idx} );
				}
			});
		}
	}
};

