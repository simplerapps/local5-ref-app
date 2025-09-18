/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.Intro = function ()
{
	/**
	 * Css for the info component
	 */ 
	this.css = { items: 
		[			
		]
	};	

	/**
	 * Images to show
	 */
	var imagesArray = 
		[
		'app/res/img/intro-pic1.jpg',
		'app/res/img/intro-pic2.jpg',
		'app/res/img/intro-pic3.jpg'			
		]; 
	
	/**
	 * My flow object for the home page is declared to define the view. It is using javascript array of 
	 * objects that can contain other array of objects, etc.
	 * 
	 */
	var demoFlow = { items: 
		[	
		// add intro text div
		{html:'div', name:'intro-text'},
		 		 
		// add circles 
		{name:'intro-circles', ac:'App.Circles'},
			
		// add buttons here
		{html:'div', name:'intro-sign-fb'},
		{html:'div', name:'intro-sign-email'}	
		]
	};
	
	// Messages to show
	var msgs = [
	    {title:'Welcome to Local5', stitle:'Connecting businesses to the community by leveraging the Local5 App Platform.'},
	    {title:'As a User..', stitle:'You can enjoy the discounts, promotions, and features of your favorite businesses in one app.'},
	    {title:'As a Business..', stitle:'You can communicate with your users about exciting news surrounding your business and products.'}	    
	];
	
	var myInst, myId ;
	var listener;
	var curPage = 0;
	var initialized = false;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config: listener
	 *  
	 */
	this.createUI = function ( parentList, config )
	{
		myInst = this;
		myId = this.compId;
		
		// get listener
		listener = config.listener;
		
		// if user not singed in
		var miscHtml = SA.listCreateUI ( myId, demoFlow, config, true );
	
		var imgHtml = getImgsHtml ( imagesArray );
		
		//html += SA.createHtmlEnd (demoFlow);
		
		return '<div id="' + myId + '">' + imgHtml + miscHtml + '</div>';
	}
	
	/**
	 * Create html from all intro images
	 */
	function getImgsHtml ( imgsArray )
	{
		var html = '<div id="intro-imgs">';
		for ( var i=0; i<imgsArray.length; i++ ) {
			html += '<div><img src="' + imgsArray[i] + '" width="100%" ></div>';
		}
		html += '</div>';
		return html;
	}
	
	this.refresh = function ()
	{
		$('#'+myId).resize();
	}
		
	/**
	 * Listener events
	 */
	this.actionPerformed = function ( event )
	{
		// next page
		if ( event.cmd == 'showNext' || event.cmd == 'showPrev' ) {
			var html = '<p style="color:white;font-size:180%;font-weight:bold;">' + msgs[event.curIdx].title + '</p>' +
			'<p style="color:black;font-size:130%">' + msgs[event.curIdx].stitle + '</p>' ;
			
			// buttoms();
			var btop = showButtons ();
			
			// msg + circles
			var mtop = showMessage ( btop, html, event.curIdx );
		}
	}
	
	/**
	 * Show textHtml message centered on page as top layer
	 */
	function showMessage ( btop, textHtml, selIdx )
	{
		var winWidth = $(window).width();
		var winHeight = $(window).height();
		var width = winWidth - 40;
		var top = btop - 200;
		var left = (winWidth - width) / 2;
		var nstyle = 'background-color:rgba(190, 190, 190, 0.5);border-radius: 10px;position:absolute;top:' + top + 
			'px;left:' + left + 'px;z-index:20;width:' + width + 'px;padding:9px;';
		
		var msgId = 'msg-' + myId;
		var html = '<div id="' + msgId + '" style="' + nstyle + '" >' + textHtml + '</div>';
		
		var $div = $('#intro-text');
		$div.css ('display', 'none');
		$div.html ( html );
		$div.show ();
		
		// draw cirles
		var cirComp = SA.lookupComponent ('intro-circles');
		cirComp.draw ( btop-15, selIdx );
		
		return top;
	}
	
	function showButtons ()
	{
		var winWidth = $(window).width();
		var winHeight = $(window).height();
		var width = winWidth - 30;
		var height = width / 6.88;
		var left = (winWidth - width) / 2;
		var top1 = winHeight - ((2 * height) + 35);
		var style = 'position:absolute;top:' + top1 + 'px;left:' + left + 'px;z-index:40;';
		var fh = '<div style="' + style + '" ><img src="app/res/img/login-facebook.png" width="' + width + '" /></div>';
		
		// uncomment to add FB button
		//$ ('#intro-sign-fb').html ( fh );
		$ ('#intro-sign-fb').html ( '' );

		var top2 = top1 + height + 10;
		style = 'position:absolute;top:' + top2 + 'px;left:' + left + 'px;z-index:40;';
		var eh = '<div style="' + style + '" ><img src="app/res/img/login-email.png" width="' + width + '" /></div>';		
		$ ('#intro-sign-email').html ( eh );
		
		return top1;
	}
	
	/**
	 * Set highlighted circles 
	 */
	function setCurCircle ( $sdiv )
	{
		var idx = $sdiv.slick ('slickCurrentSlide');
		myInst.actionPerformed ( {cmd:'showNext', curIdx:idx} );		
	}
		
	/**
	 * After compoent is loaded in page  
	 */
	var lastTime = 0;	
	this.postLoad = function ()
	{		
		var $sdiv = $( '#intro-imgs' );
		
		if ( !initialized ) {
			//console.log ( 'pl init slick');
			
			initialized = true;
			
			$sdiv.slick ({
				infinite: true,
				speed: 300,
				infinite: true,
				fade: false,
				cssEase: 'linear',
				arrows: false,
				autoplay: false});
			
			$sdiv.on('afterChange', function(event, slick, direction){
				setCurCircle ( $sdiv);
			});

			myInst.actionPerformed ( {cmd:'showNext', curIdx:0} );
		}
		
		// next page
		$('#' + myId ).hammer().bind( "swipeleft", function( event ) {			
			//console.log ( '<-- swipe' );
			if ( !accept (event) ) return;
			//console.log ( '<-- swipe ts: ' + event.timeStamp );
			 $sdiv.slick ('slickNext');
			 setCurCircle ( $sdiv);
		});
		
		// Prev page
		$('#' + myId ).hammer().bind( "swiperight", function( event ) {
			//console.log ( 'swipe -->' );
			if ( !accept (event) ) return;
			//console.log ( 'swipe --> ts: ' + event.timeStamp );
			 $sdiv.slick ('slickPrev');
			 setCurCircle ( $sdiv);			 
		});			
		
		$ ('#intro-sign-fb').hammer().bind("tap", function(event) {
			if ( !accept (event) ) return;	
			console.debug ( 'fb tap ');
		});
		
		$ ('#intro-sign-email').hammer().bind("tap", function(event) {
			if ( !accept (event) ) return;

			if (listener && listener.actionPerformed ) {
				// home: call showSignIn event 
				listener.actionPerformed ( {cmd:'showSignIn'} );
			}
		});
		
		// accept event
		function accept (event ){
			//console.log ( 'lt=' + lastTime + ', evtTs=' + event.timeStamp);
			var ret = (event.timeStamp - lastTime) > 300;
			lastTime = event.timeStamp;
			return ret;
		}				
	}	
}
