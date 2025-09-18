// Create an instance of the application
var App = {};

/**
 * Object for main application
 */
App.MainApp = function ()
{
	var initialized = false;
	var compId, myInst;
	var mainConfig = {};
	
    // Application Global Styles
    this.css =  { items:
    	[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.form-group', value:'margin-bottom:15px'},				 
			]
		},
		 
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.form-group', value:'margin-bottom:8px'},				 
			]
		}    	 
    	]
    };
    
    /**
     * Flow section of the main app  (very similar to the HTML div tags of main app structure). 
     * 
     * The flow list definition defines the Model of the application. The List and Atom components define the view (UI) of the application
	 */
    var flowObj = { items: 
    	[
    	// load loading component first
    	{name:'loading', ac:'App.Loading'},
    	     	 
    	// load home component (main coordinator component)
    	{name:'home', ac:'App.Home' }
    	]
    };
    
    // do initial server settings here
    SA.setAppConfig ( {appName:'Local5app', hostName:'https://ea1-dot-local5service.appspot.com'} );
    //SA.setAppConfig ( {appName:'Local5app', hostName:'http://localhost:8888'} );
    
	// set resource folder path (used for resources)   
	SA.res.setResPath ( 'app/res/str/' );
	

	/**  
	 * This method creates the UI based  
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		compId = this.compId;	
		myInst = this;
		
		// get passed header divId
		mainConfig.headerDivId = SA.getConfig (atomObj, 'headerDivId' );
		
		return SA.createUI ( compId, flowObj );
	}
	
	/**
	 * Gets main config
	 */
	this.getConfig = function ()
	{
		return mainConfig;
	}
	
	/**
	 * post load 
	 */
	this.postLoad = function ()
	{
		// change links behavior in the SPA
	    $( document ).on(
		    "click",
		    "a",
		    function( event ) {
		    	
		    	// if event has target and mobile, show in sep. window
		    	if ( event.target.target &&  event.target.target.length > 0 ) {
		    		
		    		if ( SA.utils.isMobileDevice() ) {
		    			
		    			//console.log  ('intercept click: ' + event.target.href );

				        // Stop the default behavior of the browser, which
				        // is to change the URL of the page.
				       event.preventDefault();
				       
				       // with inAppBrowser plug-in I can re-route the link to new window
				       window.open(event.target.href , '_blank', 'location=no');
		    		}
		    	}
		    }
		);	    
	}
}


// NOTE: NO NEED FOR THIS. 
// You can lookup var main = SA.lookupComponent ('_main');
//App.main = new App.MainApp();


/**
 * CORDOVA INITIALIZATION HERE
 * 
 * NOTE: the deviceready event is never triggered for web version of the app
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() 
    {
        if ( App.util.isMobileApp() ) {            
        	app.receivedEvent('deviceready');
        }
    },
    
    // Update DOM on a Received Event
    receivedEvent: function(id) 
    {
        console.log ( 'MainApp: deviceready: initializing APN ..' );

        var push = PushNotification.init({
            "android": {
                "senderID": "1234567890" 
            },
            "ios": {"alert": "true", "badge": "true", "sound": "true"}, 
            "windows": {} 
        });
        
        push.on('registration', function(data) {
            console.log("registration event");
            console.log(JSON.stringify(data));
            //alert ( 'register worked: ' + data.registrationId );

            // post a register device message
            App.myDeviceId = data.registrationId ;
			var homeComp = SA.lookupComponent ( 'home' );
			homeComp.handleEvent ( {cmd:'registerDevice'} );
        });

        push.on('notification', function(data) {
        	console.log("notification event");
            console.log(JSON.stringify(data));
            //alert ( 'Got notification: ' + JSON.stringify(data) );
            if ( data.additionalData && data.additionalData.serviceId ) {
            	
            	// sets / inc user service badge number
            	var svcId = Number(data.additionalData.serviceId);
            	App.util.setUserBadge ( svcId, true );
            	
            	// set the badge numbers in the UI
            	var homeComp = SA.lookupComponent ( 'home' );
    			homeComp.handleEvent ( {cmd:'setBadge', serviceId:svcId} );
            }
            
            push.finish(function () {
                //console.log('finish successfully called');
            });
        });

        push.on('error', function(e) {
            //alert ("Got push error: " + e );
        });
        
        console.log ( 'deviceready: initializing done.' );
    }
};

app.initialize();

;/**

 * BannertHandler Object  
 */
App.Banner = function ()
{
	// default color
	var DEF_COLOR = 'rgb(153, 153, 153)';
	var backgroundColor;
	
	// stylesheets for this component
	this.css = { items: 
		[
		// slide down panel
		{name:'.slide-pan', 
			value:'position:absolute;left:0px;background-image:url("app/res/img/footer_lodyas2.png");background-repeat:repeat;width:100%;z-index:999;' },
		// external panel
		{name:'.ext-pan', 
			value:'position:absolute;top:0px;left:0px;width:100%;height:100%;z-index:999;background-color:white;' },
		
		// header class
		{name:'.header',
			value:'z-index:300;height:65px;width: 100%;background-color:'+DEF_COLOR+'; position:fixed;top:0px;left: 0px;text-align:center;color: #f9f9f9;'},
		// slide content class
		{name:'.content',
			value:'padding-top:65px;'}
		]
	};
	
	// local variables
	var myId, myInst, myIdInner;
	var headId, leftId, contentId;
	var slidePanId, slideMaskId, extPageId;
	var homeListener, bodyfComp, headerfComp;
	var headerDivId;
	
	// define login atom onj
	var fviewHeader = { name:'headerFlip', lc:'App.SlickFlip', config:{} };
	var fviewBody = { name:'bodyFlip', lc:'App.SlickFlip', config:{} };
	
	
	var mleft = $(window).width()/2 - 60;
	
	var slideDownPanel = {name:'ban-sp-form', lc:'App.FormHandler', 
			config:{title:'', listener:this }, items:   
		 [
		 //{html:'div', style:'height:5px;'},
		 
		 //{html:'div', style:'font-size:140%;text-align:center', value:'User Menu' },

 		 {html:'div', style:'height:40px;'},
		 {html:'div', id:'ban-feedback', style:'margin-left:40px;font-size:130%;color:#b9b9b9;', 
			 value:'Send Feedback' },
		 
		 {html:'div', style:'height:20px;'},
		 {html:'div', id:'ban-my-account', style:'margin-left:40px;font-size:130%;color:#b9b9b9;', 
			 value:'My Account' },

		 {html:'div', style:'height:20px;'},
		 {html:'div', id:'ban-sign-out', style:'margin-left:40px;font-size:130%;color:#b9b9b9;', 
			 value:'Sign Out' },

		 {html:'div', style:'height:20px;'},
		 
		 {html:'div', id:'ban-add-svc', style:'margin-left:40px;font-size:130%;color:gray;', 
			 value:'Add a Business Icon<br><div style="font-size:80%">(For business use only)</div>' },

		 {html:'div', style:'height:30px;'},

		 {cmd:'cmdBSPCancel', ac:'App.Button', label:'Close', style:'margin-left:'+(mleft+10)+'px', 
			 config:{theme:'color'} },

		 {html:'div', style:'height:5px;'}
		 ]
	 };
	
	var extPagePanel = {name:'ban-ext-form', lc:'App.FormHandler', config:{title:'', listener:this }, items:  
		[
		{cmd:'cmdExtPageCancel', ac:'App.Button', label:'Close', style:'position:fixed;top:0px;margin-top:20px;font-size:95%', 
			config:{theme:'color'} },
	
		{html:'div', style:'margin-top:52px;', id:'ext-page-content' }
		]
	};

	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * parentList:
	 * 
	 * config:
	 * name: 'imageUrl' is the URL for image for that banner
	 * bindDivId: divId to bind the UI to
	 * 
	 * items: 
	 * list of action Atom objects
	 */  
	this.createUI = function ( list, allConfig )
	{
		myId = this.compId;
		myInst = this;
		
		if ( list.name ) {
			myId = list.name;
		}
		
		// Do some validation here
		imageUrl = SA.getConfig ( list, 'imageUrl');
		
		// get listener
		homeListener = SA.getConfig (list, 'listener');

		// get local css classes
		var headerCls = SA.localCss ( this, 'header' );
		var contentCls = SA.localCss ( this, 'content' );

		// header slider
		fviewHeader.config = {fade:true, speed:250};
		var headerTmHtml = SA.createUI (myId, fviewHeader );
		
		// body slider 
		fviewBody.config = {cls:contentCls, listener:this};
		var bodyTmHtml = SA.createUI (myId, fviewBody );
		
		// get comps from registry
		headerfComp = SA.lookupComponent ( 'headerFlip' );
		bodyfComp = SA.lookupComponent ( 'bodyFlip' );

		// content id
		contentId = 'cont-' + myId;
		extPageId = 'ext-' + myId;
		myIdInner = 'in-' + myId;
		leftId = 'left-' + myId; 
		
		// set background color
		backgroundColor = DEF_COLOR;
		
		// HIDE: render slide-down panel html
		var slidePanHtml = getSlidePanelHtml ();
		var extPageHtml = getExtPageHtml();
		
		// get header div id
		setHeaderTm ( headerCls, allConfig.hidden, headerTmHtml );
		
		// wrap with my own div
		var ret = '<div style="display:none" id="' + myId + '">' + 
					bodyTmHtml + '</div>' + slidePanHtml + extPageHtml;
		
		return ret;
	}
	
	function setHeaderTm ( cls, hidden, html )
	{
		headerDivId = App.util.getMainComp().getConfig().headerDivId;
		var $headDiv = $('#'+headerDivId);
		$headDiv.addClass ( cls );
		if ( hidden == true ) 
			$headDiv.css ( 'display', 'none' );
		$headDiv.html (  html );
	}
	
	
	/**
	 * Change the banner's heading html
	 */
	this.changeUI = function ( headHtml, newStyle )
	{
		if ( newStyle ) {
			var bgst = extractStyle ('background-color:', newStyle);
			if ( bgst ) {
				backgroundColor = bgst;
				$('#'+myIdInner).css ('background-color', bgst );
			}
		}
		else {
			backgroundColor = DEF_COLOR;
			$('#'+myIdInner).css ('background-color', backgroundColor );
		}

		if ( headHtml ) {
			$('#'+headId).html ( headHtml );
		}
	}
	
	/**
	 * Extract style from css styles
	 */
	function extractStyle ( name, styles )
	{
		if ( !styles ) return;
		var i0 = styles.indexOf ( name );
		if ( i0 >=0 ) {
			var i1 = styles.indexOf ( ';', i1+1 );
			if ( i1 > 0 ) 
				return styles.substring (i0+name.length, i1);
			else 
				return styles.substring (i0+name.length);	
		}
	}
	
	/**
	 * Show first page
	 */
	this.showFirst = function ( dataId, banHtml, pageHtml )	
	{
		headerfComp.reset();
		bodyfComp.reset();
		if ( bodyfComp.curPageIdx() == 0 ) {
			$('#'+myId).show ();
		}
		// set whole page html
		setWholePageHtml( getHeaderHtml (banHtml), getContentHtml(pageHtml) );
	}
	
	/**
	 * Show next page. If passedTitle == true, then banHtml only contains title,
	 * otherwise a full header 
	 */
	this.showNext = function ( dataId, banHtml, pageHtml, passedTitle )
	{
		if ( bodyfComp.curPageIdx() == 0 ) {
			myInst.show ( true );
		}

		// if passedTitle flag set, then banHtml == title
		if ( passedTitle == true ) {
			setWholePageHtml ( getHeaderHtml (getBackBanner(banHtml)), pageHtml);
		}
		else {
			setWholePageHtml ( banHtml, pageHtml);
		}
	}
	
	/**
	 * Make a whole page from header and content
	 */
	function setWholePageHtml ( bannerHtml, contentHtml )
	{
		 var headHtml = '<div oid="' + myId + '">' + bannerHtml + '</div>';
		 var bodyHtml = '<div oid="' + myId + '">' + contentHtml + '</div>';
		 
		 headerfComp.setNextPage ( headHtml );
		 bodyfComp.setNextPage ( bodyHtml );
	}
	
	/**
	 * Show previous page
	 */
	this.showPrev = function () 
	{
		headerfComp.showPrev();
		bodyfComp.showPrev ();
	}	
	
	/**
	 * MAIN MENU: Show a slide-down panel
	 */
	var spPanelShown = false;
	this.showSPanel = function ()
	{
		if ( !spPanelShown ) {
			var $mask = $('#'+slideMaskId);
			$mask.css ( 'top', '65px' );
			$mask.show ();
			
			var $pan = $('#'+slidePanId);
			$pan.css ( 'top', '65px' );
			$pan.slideDown( 200 );
			spPanelShown = true;
		}
		else {
			var $pan = $('#'+slidePanId);
			$pan.slideUp( 100 );
			var $mask = $('#'+slideMaskId);
			$mask.hide ();
			
			spPanelShown = false;			
		}		
	}
	
	/**
	 * SINGLE PAGE: showing method
	 */
	this.showSinglePage = function ( show, panelHtml )
	{
		if ( show == true ) {
			$('#ext-page-content').html ( panelHtml );
			$('#'+extPageId).fadeIn ( 'fast' );
		}
		else {
			$('#ext-page-content').html ('');
			$('#'+extPageId).hide ();
		}
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdBSPCancel' ) {
			myInst.showSPanel ();
		}
		else if ( actionAtom.cmd == 'cmdExtPageCancel') {
			myInst.showSinglePage (false);
		}
	}
	
	/**
	 * Action performed listener notification 
	 */
	this.actionPerformed = function ( event )
	{
		// got notification from body changed page
		if ( event.cmd == 'showNext' ) {
			var idx = event.curIdx;
			// show corresponding header 
			headerfComp.showPageIdx ( idx );
		}
	}
		
	/**
	 * Reset banner flipper
	 */
	this.reset = function ()
	{
		headerfComp.reset();
		bodyfComp.reset();
	}
	
	/**
	 * Show / hide banner
	 */
	this.show = function ( isShown )
	{
		if ( isShown == true ) {
			$('#'+myId).show ();
			myInst.showHeader ( true );
		}
		else { 
			$('#'+myId).hide ();
			myInst.showHeader ( false );			
		}
	}
	
	/**
	 * Set page scroll start (true), stop (false)
	 */
	this.showHeader = function ( show )
	{
		if ( show ) {
			$('#'+headerDivId).show();
		}
		else {
			$('#'+headerDivId).hide();
		}
	}
	
	/**
	 * Make custom banner 
	 */
	this.getCustom = function ( banHtml, newStyle )
	{
		return getHeaderHtml (banHtml, newStyle);
	}
	
	/**
	 * Content html under the header
	 */
	function getContentHtml ( html )
	{
		return '<div id="' + contentId + '">' + html + '</div>';
	}
	
	/**
	 * Get external page html
	 */
	function getExtPageHtml ()
	{
		var cls = SA.localCss ( myInst, 'ext-pan');
		return '<div id="' + extPageId +'" class="' + cls + '" style="display:none" >' + 
			SA.createUI ( myId, extPagePanel ) + '</div>';
	}
	
	/**
	 * Get slide down panel and dark background mask
	 */
	function getSlidePanelHtml ()
	{
		slideMaskId = 'ban-smp-' + myId;
		var smpHtml = '<div style="display:none;position:absolute;left:0px;background-color:#000;opacity:0.5;width:100%;height:100%;z-index:100;" id="' + 
			slideMaskId + '"/>' ;
		
		var css = SA.localCss (myInst, 'slide-pan' );
		slidePanId = 'ban-sdp-' + myId;
		var sdpHtml = '<div class="' + css + '" style="display:none;" id="' + slidePanId + '">' + 
			SA.createUI ( myId, slideDownPanel ) + '</div>';
		
		return smpHtml + sdpHtml ;
	}
	
	/**
	 * Render general banner
	 */
	function getHeaderHtml ( headerHtml, newStyle )
	{
		var width = $(window).width();
		
		var style1 = 'background-color:'+backgroundColor;
			//'position:fixed;top:0px;background-color:'+backgroundColor+';margin:0px;height:'+ bannerHeight+'px;width:'+width+'px';
		var style2 = 'width:93%;margin-left:auto;margin-right:auto;';
		
		if ( newStyle )
			style1 = newStyle;
		
		headId = 'head-' + myId;
		
		var html = 
		'<div oid="' + myId + '" id="' + myIdInner + '" style="' + style1 + '"  >' +
			'<div style="' + style2 + '">';
		
		html += '<div id="' + headId + '">' + headerHtml + '</div></div></div>'; 			
		return html;
	}
	
	function getHomeBanner ()
	{
		return '<div style="display:none">home</div>';
	}
	
	function getBackBanner (title, colBG)
	{
		var titleHtml = '';
		if ( title && title.length>0 ) {
			titleHtml = '<div style="text-align:center;padding-top:26px;color:white;font-size:140%;margin-top:-75px">' + 
			title + '</div>';
		}
		
		var backImgUrl = 'app/res/img/backicon-wt.png';
		var backButton =  '<img id="' + leftId + '" src="' + backImgUrl + 
				'" style="width:45px;margin-left:10px;padding-top:20px;padding-bottom:20px;" />';
		return '<div>' + backButton + titleHtml +'</div>';
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created)
	 */ 
	var lastTime = 0;
	this.postLoad = function ()
	{
		// go back
		$( '#'+leftId ).hammer().bind("tap", function(event) {
			lastDataId = '';
			if ( !accept (event) ) return;
			
			if ( bodyfComp.curPageIdx() == 0 ) {
				// hide banner
				myInst.show ( false );
				// back to home
				homeListener.actionPerformed ( {cmd:'back'} );
			}
			// show previous banner and header
			myInst.showPrev ();
		});
		
		// menu - add service (not used for now)
		$('#ban-add-svc').hammer().bind("tap", function(event) {
			if ( !accept (event) ) return;
			myInst.showSPanel (); // hide
			var comp = SA.lookupComponent ('svcAdmin');
			comp.adminService ();
		});
		
		// menu - get feedback
		$('#ban-feedback').hammer().bind("tap", function(event) {
			if ( !accept (event) ) return;
			myInst.showSPanel (); // hide
			var comp = SA.lookupComponent ('feedBack');
			comp.showFeedbackDlg ();
		});
		
		// menu - my account option 
		$('#ban-my-account').hammer().bind("tap", function(event) {
			lastDataId = '';
			if ( !accept (event) ) return;
			myInst.showSPanel (); // hide

			// TEST // //6014328603934720,5073146650558464
			//SA.fireEvent ( 'home', {cmd:'setBadge', serviceId:5130321255202816} );
			//SA.fireEvent ( 'home', {cmd:'setBadge', serviceId:5411796231913472} );
			// 
			
			var userAdmin = SA.lookupComponent ('userAdmin');
			var banner = SA.lookupComponent ( 'banner' );
			banner.showNext ( 'adminUser', 'My Account', 
					userAdmin.getAdminUI(), true );
		});
		
		$('#ban-sign-out').hammer().bind("tap", function(event) {
			lastDataId = '';
			if ( !accept (event) ) return;
			// logout user
			SA.deleteUserAuth();			
			myInst.showSPanel ();
			var home = SA.lookupComponent ( 'home' );
			home.reload();
		});

		/*
		var lastScrollTop = 0;
		$('#page').scroll(function(event)  {
			var st = $(this).scrollTop();
			var diff = st - lastScrollTop;
			console.log ( 'scroll diff=' + diff );
			if ( diff > 80 ){		// down
				myInst.showHeader (false);
			} 
			else {	// up
				myInst.showHeader (true);
			}
			lastScrollTop = st;
		});
		*/
		
		// accept event
		function accept (event ){
			var ret = (event.timeStamp - lastTime) > 100;
			lastTime = event.timeStamp;
			return ret;
		}		
	}
};
;/**
 * BannertHandler Object  
 */
App.Feedback = function ()
{
	var mleft = $(window).width()/2 - 140;
	
	/**
	 * Login flow list
	 */
	var flowList = { items: 
		[
		{name:'feedback-dlg', lc:'App.Dialog', config:{small:true}, items:
			 [
			 {name:'feedback-form', lc:'App.FormHandler', 
				 	config:{title:'', listener:this}, items:   
				 [
				 {html:'div', style:'height:25px;'},
				 {html:'div', style:'font-size:115%', value:'Please send us your feedback or complaint and we will email you back. <b>We appreciate your feedback and your business!</b>'},				  
				  
				 {name:'relItemId', ac:'App.Variable'},

				 {html:'div', style:'height:5px;'},  
				 {name:'feedMsg', ac:'App.Message' },
				 {html:'div', style:'height:12px;'},  
				 
				 {name:'feedText', ac:'App.TextArea', info:'Please type your message here..', 
					 required:true, pattern:'text', config:{rows:3} },
				 
				 {html:'div', style:'height:10px;'},

				 {cmd:'cmdPostFeed', ac:'App.Button', label:'Send Feedback', config:{theme:'color',defButton:true},
					 style:'margin-right:10px;margin-left:'+mleft+'px'},
				 {cmd:'cmdCancelFeed', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },

				 {html:'div', style:'height:10px;'},
				 ]
			 }
			 ]
		}
		]
	};
	
	var myId, myInst;
	var curListId;
	var currentDlg;
	var initialized = false;
	
	/**
	 * This method creates the UI based on the lists provided
	 */  
	this.createUI = function ( list, allConfig )
	{
		myId = this.compId;
		myInst = this;
	}
	
	/**
	 * Show feedback dialog
	 */
	this.showFeedbackDlg = function ( listId )
	{
		if ( !initialized ) {
			initialized = true;
			SA.createUI (myId, flowList);
		}		
		curListId = listId;
		showDialog ( 'feedback-dlg', {} );
	}
	
	/**
	 * Action performed by button clicks
	 */
	this.performAction = function ( shareActionName )
	{
		//console.debug ( 'action perf: ' + event );
		if ( listener && listener.actionPerformed ) {
			listener.actionPerformed ( {cmd:shareActionName})
		}
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( action, atomList, dataObj )
	{
		if ( action.cmd == 'cmdPostFeed' ) {
			if ( validate ( 'feedMsg', atomList, dataObj ) ) {
				var form = new FormData();
				form.append ( 'msg', App.util.safeHtml(dataObj.feedText) );
				form.append ( 'relItemId', curListId );
				currentDlg.setWaiting (true);
				SA.server.postForm ("/rs/feedback", form, postFBSuccess);
			}
		}
		else if ( action.cmd == 'cmdCancelFeed' ) {
			// hide dialog
			hideDialogFeedback ();
		}
	}
	
	/**
	 * Post success
	 */
	function postFBSuccess (respStr)
	{
		// hide dialog
		hideDialogFeedback ();
	}
	
	/**
	 * validation 
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, 'Message cannot be empty!', false );
			return false;
		}
		return true;
	}
	
	/*
	 * Shows a messaage 
	 */
	function showMessage ( name, msg, success )
	{
		var msgComp = SA.lookupComponent ( name );
		msgComp.showMessage ( msg, success );
	}
	
	/*
	 * Show a dialog with name
	 */
	function showDialog ( dialogName, newForm )
	{
		currentDlg = SA.lookupComponent ( dialogName );
		if ( currentDlg ) {
			if ( newForm )
				currentDlg.updateForm ( newForm );
			currentDlg.showDialog (true );
		}
		return currentDlg;
	}
	
	function hideDialogFeedback ()
	{
		currentDlg.setWaiting (false);
		currentDlg.showDialog (false );
	}
};
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.Heading = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * param name: imageUrl
	 * param name: ilists
	 *  
	 */
	this.createUI = function ( parentList, config )
	{
		myId = this.compId;
		myInst = this;
		
		//var appTitle = 'Alameda Theatre';
		var title = SA.getConfig (parentList, 'title', 'Local5' );		
		
		// for Local-5
		var titleStyle = SA.getConfig ( parentList, 'titleStyle', '' );
		
		//margin-bottom:-58px;margin-left:-16px;
		var titleStyle = 
			'text-align:center;font-size:180%;font-weight:bold;color:#eaeaea;padding-top:22px;margin-bottom:-56px;' + 
			titleStyle;

		// for Alameda Theatre
		//var titleStyle = 'text-align:center;margin-bottom:-54px;margin-left:-16px;font-size:150%;color:white;padding-top:24px;';
		
		var winWidth = $(window).width();
		var mleft = (winWidth / 2) - 105;
		
		var html = 
		'<div style="' + titleStyle + '">' + title + '</div>' +  
		'<div><div style="float:left;margin-top:28px;margin-left:0px;" id="user-menu"><img src="app/res/img/menu-lines.png" width="40"/></div>'+
		'<div style="float:right;margin-top:28px;margin-right:2px;" id="svc-full-reload"><img src="app/res/img/menu-reload.png" width="40"/></div></div>';
		
		return getMessage ( 10, html );
	}
	
	/**
	 * Show textHtml message centered on page as top layer
	 */
	function getMessage ( mleft,  mHtml )
	{
		//var mwidth = $(window).width() - ( mleft * 2 ) ;
		
		html = '<div id="' + myId + '" style="margin-left:' + mleft + 'px" >' + 
			mHtml + '</div>';
		return html;
	}	
	
	/**
	 * Action performed 
	 */
	this.actionPerformed = function ( action )
	{
	}
	
	/**
	 * Called to handle events specific for this component
	 */
	this.handleEvent = function ( event )
	{
	}
	
	/**
	 * After compoent is loaded in page  
	 */
	var lastTime = 0;
	this.postLoad = function ()
	{	
		$('#user-menu').hammer().bind("tap", function(event) {
			if ( !accept (event) ) return;
			var ban = SA.lookupComponent ( 'banner' );
			ban.showSPanel ( '<div style="height:400px">MENU PAGE</div>' );
		});
		
		$('#qrcode').hammer().bind("tap", function(event) {
			if ( !accept (event) ) return;
			var qrm = SA.createComponent ('qrManager', 'App.QRManager');
			qrm.createUI ();
			qrm.showDialog ();
		});
		
		$('#svc-full-reload').hammer().bind("tap", function(event) {
			// reload all the services from DB			
			if ( !accept (event) ) return;
			SA.fireEvent ( 'home', {cmd:'postSignIn'} );
		});
		
		// accept event
		function accept (event ){
			var ret = event.timeStamp > lastTime;
			lastTime = event.timeStamp;
			return ret;
		}		
	}
}
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.Home = function ()
{
	/**
	 * My flow object for the home page is declared to define the view. It is using javascript array of 
	 * objects that can contain other array of objects, etc.
	 * 
	 */
	var homeFlow = { items: 
		[
		// MISC Components
		// svc search component
		{name:'svcSearch', lc:'App.SvcSearch' },
		
		// load admin component
		{name:'svcAdmin', lc:'App.SvcAdmin' },
		{name:'userAdmin', lc:'App.UserAdmin' },
		
		// dlg components
		{name:'dlgHelper', lc:'App.DlgHelper' },
		{name:'feedBack', lc:'App.Feedback'}, 
		 
		// show banner here
		{name:'banner', lc:'App.Banner', config:{listener:this} },
		
		// login component
		{name:'login', lc:'App.Login' }
		]
	};

	/**
	 * Intro component
	 */
	var introFlow = {name:'intro', lc:'App.Intro', config:{listener:this} };
	
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var serviceComp = undefined;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * param name: imageUrl
	 * param name: ilists
	 *  
	 */
	this.createUI = function ( parentList, config )
	{
		myInst = this;
		myId = this.compId;
		
		// create 'dataManager' singleton component
		dataManager = SA.createComponent ( 'dataManager', 'App.DataManager' );
		
		// logged in flag
		var loggedIn = SA.getUserAuth ();			
		
		var homeHtml = SA.createUI ( myId, homeFlow, {hidden:loggedIn==undefined} );
		
		// get service component once
		serviceComp = SA.createComponent ( 'service', 'App.Service' );

		// create intro page anyway
		var introHtml = SA.createUI ( myId, introFlow );
		var introSt = '';
		
		// Logged in: if user logged in show page
		if ( loggedIn ) {
			introSt = 'display:none';
			SA.fireEvent ( 'home', {cmd:'postSignIn'} );		
		}

		// check for reset password, if passed, go to that page directly
		if ( getPassedReset() ) {
			loadResetPassPage ();
		}
		
		var ret = '<div id="home-div"><div id="' + myId + '">' + homeHtml + 
				'<div id="intro-pages" style="'+introSt+'" >' + introHtml + '</div></div></div>';
		return ret;
	}
	
	/*
	 * re-Load home page
	 */
	this.reload = function ()
	{
		// User NOT logged in, show intro page 
		if ( !SA.getUserAuth () ) {
			var ban = SA.lookupComponent ( 'banner' );
			ban.show (false);
			$('#intro-pages').fadeIn ('fast');
			var intc = SA.lookupComponent ( 'intro');
			intc.refresh();
		}
		else {
			SA.fireEvent ( 'home', {cmd:'postSignIn'} );	
		}
	}
		
	/**
	 * Action performed 
	 */
	this.actionPerformed = function ( action )
	{
		if ( action.cmd == 'back' ) {
			var $home = $('#intro-pages' );
			// show home back
			$home.show ();
		}
		else if ( action.cmd == 'showSignIn' ) {
			var loginComp = SA.lookupComponent ('login');
			var loginHtml = loginComp.getLoginUI ();

			var banner = SA.lookupComponent ( 'banner' );
			banner.reset (); // reset back
			banner.show (true);
			
			// save prev html
			$('#intro-pages').hide ();	
			banner.showNext ( 'login', '&nbsp;&nbsp;&nbsp;', loginHtml, true );
		}
	}
	
	/**
	 * Called to handle events specific for this component
	 */
	this.handleEvent = function ( event )
	{
		/// after sign in successful 
		if ( event.cmd == 'postSignIn' ) {
			
			// if logged in, do initial load from DB
			var auth = SA.getUserAuth ();
			
			if ( auth ) {
				App.util.startWorking();

				// **** REMOVE ME: testing
				//App.myDeviceId = 'test-device-samiphone-101010189999ZZZ';
				// try register device if id exists
				if ( App.myDeviceId ) {
					SA.fireEvent ( myId, {cmd:'registerDevice'} ) ;
				} 
				
				// clear cache
				dataManager.clearUserServices();
				// load user services
				dataManager.getUserServices ( dataHandler );
				function dataHandler (status, data ) 
				{										
					if ( status == 'OK' ) {
						loadServices ();
						
						// get participation group data 
						if ( auth.respData.groupId && auth.respData.groupId>0 ) {
							dataManager.getGroupData ( auth.respData.groupId, groupHandler );
							function groupHandler (status, data ) 
							{
								if ( status == 'OK' ) {
									// refresh banner
									SA.fireEvent ( myId, {cmd:'setBannerUI', data:data} );
								}
							}
						}
						else {
							// reset UI
							SA.fireEvent ( myId, {cmd:'setBannerUI'} );
						}
						App.util.stopWorking();
					}
					else {
						SA.deleteUserAuth();
						myInst.reload();
						App.util.stopWorking();						
					}
				}
			}
		}
		
		// Event to reload services
		else if ( event.cmd == 'loadServices' ) {
			App.util.startWorking();
			loadServices ();
			App.util.stopWorking();
		}
		
		// Async. request to change banner UI
		else if ( event.cmd == 'setBannerUI' ) {
			var dat = event.data;
			var dname, dstyle;
			if ( dat ) {
				dname = dat.dispName;
				dstyle = dat.dispStyle;
			}			
			var heading = {name:'heading', 
					lc:'App.Heading', 
					config:{title:dname, titleStyle:dstyle} };
			var ban = SA.lookupComponent ( 'banner');
			ban.changeUI ( SA.createUI (myId, heading), dstyle);
			App.util.stopWorking();
		}
		
		// register device
		else if ( event.cmd == 'registerDevice' ) {
			// register device with server (if id changed)
			if ( App.myDeviceId ) {
				var storedDeviceId = App.util.getUserData() ['deviceId'];
				if ( !storedDeviceId || storedDeviceId!=App.myDeviceId ) {
					dataManager.registerDeviceId (App.myDeviceId, regResult );
					function regResult (status, data ) {
						App.util.setUserDeviceId ( App.myDeviceId );
						//console.log ( 'Register device id status: ' + status );
					}
				}
			}
		}
		
		// Set badge for one service (either set or clear depending on count)
		else if ( event.cmd == 'setBadge' ) {
			var dataObj = App.util.getUserData ();
			var userServices = dataManager.getUserServices();
			var passedSvcId = event.serviceId;
			
			for (var i=0; i<userServices.length; i++ ) {
				if ( passedSvcId ==  userServices[i].sconf.id ) {
					var num = dataObj [passedSvcId];
					// set badge
					if ( num && num>0 ) {
						var userSvc = userServices[i];
						serviceComp.setIconUI (userSvc.divId, userSvc.sconf, num);
					}
					// clear badge
					else {
						var userSvc = userServices[i];
						serviceComp.setIconUI (userSvc.divId, userSvc.sconf);
					}
					break;
				}
			}		
		}
		
		// show reset password
		else if ( event.cmd == 'showResetPass' ) {
			var loginComp = SA.lookupComponent ('login');
			var loginHtml = loginComp.getResetPassUI ( event.data );
			var banner = SA.lookupComponent ( 'banner' );
			banner.reset (); // reset back 
			banner.show (true);
			
			// save prev html
			$('#intro-pages').hide ();	
			banner.showFirst ( 'reset', '<div style="color:white;font-size:170%;text-align:center;padding-top:20px">Local-5</div>', 
					loginHtml );			
		}
	}
	
	/*
	 * Load home page services
	 */
	function loadServices ()
	{
		// if user is authenticated
		if ( SA.getUserAuth () ) {
			// load admin pages based on URL '/?admin'
			if ( getPassedAdmin() ) {
				loadAdminPages ();
			}
			else {
				$('#intro-pages' ).hide();
				var banner = SA.lookupComponent ( 'banner' );
				var defHeading = {name:'heading', lc:'App.Heading' };
				var mappsList = {name:'mappsList', lc:'App.MappList', config:{} };
				
				banner.showFirst ( 'mainPage', 
					SA.createUI (myId, defHeading),
					SA.createUI (myId, mappsList) );
			}
		}
		// NOT authenticated 
		else {
			// show intro page
			$('#intro-pages' ).fadeIn ('slow');
		}		
	}
	
	/*
	 * Load admin pages
	 */
	function loadAdminPages ()
	{
		var idx = location.search.indexOf ('admin/');
		var qstr = '';
		if ( idx > 0 ) {
			qstr = location.search.substring (idx+6);
		}
		
		$('#intro-pages' ).hide();
		var banner = SA.lookupComponent ( 'banner' );

		var heading = {name:'heading', lc:'App.Heading', config:{} };
		var adminList = {name:'flexAdmin', lc:'App.FlexAdmin', config:{qstr:qstr} };
		
		banner.showFirst ( 'mainPage', 
			SA.createUI (myId, heading),
			SA.createUI (myId, adminList) );
	}
	
	/*
	 * Load admin pages
	 */
	function loadResetPassPage ()
	{
		var idx = location.search.indexOf ('?reset');
		var qstr = '';
		if ( idx >= 0 ) {
			qstr = location.search.substring (idx+7);
		}
		if ( qstr.length < 40 ) {
			return;
		}
		
		// log the user out
		SA.deleteUserAuth();
		SA.fireEvent ( myId, {cmd:'showResetPass', data:qstr} );
	}
	
	/**
	 * Get passed ID as param
	 */
	function getPassedAdmin()
	{
		//?id=5631698557468672
		if ( location.search ) {
			var idx = location.search.indexOf ('admin');
			return idx >= 0 ;
		}
	}
	
	/**
	 * Get passed ID as param
	 */
	function getPassedReset()
	{
		//?reset=crypto-token-xxxxxx
		if ( location.search ) {
			var idx = location.search.indexOf ('reset');
			return idx >= 0 ;
		}
	}	
}
;/**
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
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 * 
 *  1- Its "css" to define local css classes
 *  2- Its "flow" to define the view declaratively    
 *  3- Other Imperative code to control the behavior and action of the page
 *  
 */
App.Login = function ()
{
	/**
	 * The CSS class names are unique to this class. For example if another class has the name 'rounded'
	 * it would be a different name because the names are distinguished based on unique class component type id
	 * that are assigned automatically at object creation time. 
	 * CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	 * 
	 */
	this.css = { items: 
		[
		]
	};
	
    var myId, myInst;
    
    var currentFormName = undefined;
    var currentFormComp = undefined;    
    var lastErrDivId = undefined;

	/**
	 * Login flow list
	 */
	var loginList = {name:'login-form', lc:'App.FormHandler', 
			 	config:{title:'Please Sign In', listener:this, pageStyle:true}, items: 
		 [
		 {html:'div', value:'Please Sign In', Style:'font-size:140%' },
		 {html:'div', style:'height:5px;'},		 
		 {name:'lgMsg', ac:'App.Message' },
		 {html:'div', style:'height:12px;'},
		 {name:'lgEmail', ac:'App.TextField', info:'Email address', required:true, pattern:'email',
			 config:{type:'email'} },
		 {name:'lgPassword', ac:'App.TextField', info:'Password', required:true, pattern:'text',
			 config:{type:'password'}},

		 {html:'div', style:'height:12px;'},
		  
		 {cmd:'cmdLogin', ac:'App.Button', label:'Sign me in', config:{theme:'color'} },
		 //{cmd:'cmdCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },

		 {html:'div', style:'height:25px;'},

		 {cmd:'cmdShowCreate', ac:'App.Button', label:'Create new account', 
			 config:{type:'link'}, style:'float:left;font-size:105%;margin-bottom:10px;' },
		 {cmd:'cmdShowForgot', ac:'App.Button', label:'Forgot password?', 
		     config:{type:'link'}, style:'float:right;font-size:105%;margin-bottom:10px;' }
	 	 ]
	};
	
   var forgotList = {name:'forgot-pass-form', lc:'App.FormHandler', 
			 	config:{title:'I Forgot my Password', listener:this, pageStyle:true}, items: 
		 [
		 {html:'div', value:'Forgot Your Password?', Style:'font-size:140%' },
		 {html:'div', style:'height:5px;'},		 		 
		 {name:'fgMsg', ac:'App.Message' },
		 {html:'div', style:'height:20px;'},
		  
		 {html:'p', value:'Enter your registered email address, and we will email you a reset password link:'},
		 {name:'lgEmail', ac:'App.TextField', info:'Email address', required:true, pattern:'email'},				 
	     {html:'div', style:'height:15px;'},
			 
	     {cmd:'cmdEmailPass', ac:'App.Button', label:'Email me link'},
		 //{cmd:'cmdCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
		 {html:'div', style:'height:25px;'}
		 ]
	 };
	
	var createList = {name:'create-acct-form', lc:'App.FormHandler', 
		 	config:{title:'Create New Account', listener:this, pageStyle:true}, items: 
		 [
		 {html:'div', value:'Create New Account', Style:'font-size:140%' },
		 {html:'div', style:'height:5px;'},		 

		 {name:'crMsg', ac:'App.Message' },
		 {html:'div', style:'height:12px;'},
		  
		 {name:'crName', ac:'App.TextField', info:'Name: First Last ', 
			 required:true, pattern:'text' },

		 {name:'lgEmail', ac:'App.TextField', info:'Email address',
			 required:true, pattern:'email', config:{type:'email'} },
		 
		 {name:'crPassword', ac:'App.TextField', info:'Password', config:{type:'password'},
				 required:true, pattern:'text' },
			 
		 {html:'div', style:'height:10px;'},

		 {html:'div', style:'font-size:90%;', 
			 value:'By clicking "Create new account" below, you agree to ' + 
			 '<a style="font-size:110%" target="_blank" href="app/res/text/EULA.html" target="_blank">this End User License Agreement</a>'},

		 /*
		 {cmd:'cmdShowAgreement', ac:'App.Button', style:'font-size:85%',
			 label:'By clicking "Create new account" below you agree to <b>this License Agreement</b>', 
			 config:{type:'link'} },
		 */
		 
		 {html:'div', style:'height:10px;'},
		 
		 {cmd:'cmdCreateAcct', ac:'App.Button', label:'Create new account'},
		 
		 {html:'div', style:'height:20px;'},
		 
		 {cmd:'cmdShowLogin', ac:'App.Button', label:'I already have an account', 
			 style:'font-size:110%', config:{type:'link'} },
		 ]
	 };
	
	var resetPassForm = {name:'password-reset-form', lc:'App.FormHandler', 
		 	config:{title:'Reset Your Password', listener:this, pageStyle:true}, items: 
		 [
		 {html:'div', value:'Reset Password Form', Style:'font-size:140%' },
		 {html:'div', style:'height:5px;'},		 

		 {name:'lgrMsg', ac:'App.Message' },
		 {html:'div', style:'height:12px;'},
		 
		 {name:'passToken', ac:'App.Variable'},
		 
		 //{html:'div', style:'height:4px;'},
		 {name:'lgrPassword1', ac:'App.TextField', info:'New Password', required:true, pattern:'text',
			 config:{type:'password'}},
			 
		 {name:'lgrPassword2', ac:'App.TextField', info:'Re-type New Password', required:true, pattern:'text',
			 config:{type:'password'}},

		 {html:'div', style:'height:10px;'},
		  
		 {cmd:'cmdResetLogin', ac:'App.Button', label:'Save Password', config:{theme:'color'} },

		 {html:'div', style:'height:25px;'},
	 	 ]
	};

	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * param name: imageUrl
	 * param name: ilists
	 */
	this.createUI = function ( parentList, config )
	{
		myId = this.compId;
		myInst = this;
		return '';
	}
	
	/**
	 * Gets the login UI
	 */
	this.getLoginUI = function ()
	{
		App.util.stopWorking();
		
		// show login dialog 
		var userName = SA.getAppData ( 'userName' );
		
		var html = showFormHtml ( loginList, userName, true );
		return '<div id="login-ui">' + html + '</div>';
	}
	
	/**
	 * Gets the login UI
	 */
	this.getResetPassUI = function ( token)
	{
		App.util.stopWorking();
		
		updateList ( resetPassForm, {passToken: token} );
		var html = showFormHtml ( resetPassForm, '', true );
		return '<div id="login-ui">' + html + '</div>';
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdShowCreate' ) {
			var userName = SA.getAppData ( 'userName' );
			showFormHtml ( createList );			
		}
		else if ( actionAtom.cmd == 'cmdShowForgot' ) {
			var userName = SA.getAppData ( 'userName' );
			showFormHtml ( forgotList, userName );	
		}		
		else if ( actionAtom.cmd == 'cmdShowLogin' ) {
			var userName = SA.getAppData ( 'userName' );
			showFormHtml ( loginList, userName );			
		}
		else if ( actionAtom.cmd == 'cmdShowAgreement' ) {
			var ban = SA.lookupComponent ('banner');
			var comp = SA.createComponent ( 'ttf-frame', 'App.LinkFrame' );
		    var html = comp.createUI ('', {srcUrl:'app/res/text/EULA.html'} );
			ban.showSinglePage ( true, html );
		}
		else { 
			// Login command
			if ( actionAtom.cmd == 'cmdLogin' ) {
				lastErrDivId = 'lgMsg';
				if ( validate ( 'lgMsg', atomList, dataObj )  ) {
					var data = {};
					data.email = dataObj.lgEmail;
					data.authToken = dataObj.lgPassword;
					showWaiting ( true );
					var dm = SA.lookupComponent ('dataManager');
					dm.authLogin ( data, authResult );
				}
			}
			// Create Account command			
			else if ( actionAtom.cmd == 'cmdCreateAcct' ) {
				lastErrDivId = 'crMsg';				
				if ( validate ( 'crMsg', atomList, dataObj ) ) {
					var data = {};
					data.firstName = App.util.getName (dataObj.crName, true);
					data.lastName = App.util.getName (dataObj.crName, false);
					data.email = dataObj.lgEmail;
					data.authToken = dataObj.crPassword;
					showWaiting ( true );
					var dm = SA.lookupComponent ('dataManager');
					dm.authCreateAcct ( data, authResult );
				}		
			}
			// Change password command						
			else if ( actionAtom.cmd == 'cmdEmailPass' ) {
				lastErrDivId = 'fgMsg';
				if ( validate ( 'fgMsg', atomList, dataObj ) ) {
					var data = {};
					data.msg = "EMAIL-ME-RESET-PASSWORD";
					data.userId = dataObj.lgEmail;
					showWaiting ( true );
					var dm = SA.lookupComponent ('dataManager');
					dm.authEmailReset ( data, resetResult );
				}
			}	
			else if ( actionAtom.cmd == 'cmdResetLogin' ) {
				if ( validatePass ( 'lgrMsg', atomList, dataObj ) ) {
					var data = {};
					data.email = dataObj.passToken;
					data.authToken = dataObj.lgrPassword1;
					data.resetPassword = "true";
					showWaiting ( true );
					SA.server.set ("/rs/user", data, postResetSuccess);
				}
			}			
		}
	}
	
	/**
	 * Logging out user
	 */
	this.logoutUser = function ()
	{
		SA.deleteUserAuth();
	}
	
	/**
	 * Enable / disable form wait
	 */
	function showWaiting ( isWaiting )
	{
		if ( isWaiting == true ) {
			currentFormComp = SA.lookupComponent (currentFormName);
			currentFormComp.setWaiting ( true );
		}
		else {
			currentFormComp.setWaiting ( false );
		}
	}

	/**
	 * Show new form html
	 */
	function showFormHtml ( renderList, userName, retHtml )
	{
		// TODO: Need to pre-load username in list to show
		if ( userName ) {
			updateList (renderList, {lgEmail:userName} );
		}
		currentFormName = renderList.name;
		var html =  SA.createUI ( myId, renderList );
		
		if ( retHtml == true )
			return html;
		else 
			$('#login-ui').html ( html );
	}
	
	/*
	 * Password reset successful post result 
	 */
	function updateList ( listObj, dataObj )
	{
		App.util.mergeList ( listObj, dataObj );
	}
	
	/*
	 * Password reset successful post result 
	 */
	function resetResult ( respStr )
	{
		showMessage ( lastErrDivId, "An email has been sent to the address below", true);
		showWaiting ( false );
	}
	
	/*
	 * Validate login form
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, msg, false );
			return false;
		}
		else if (data.crPassword && data.crPassword.length<6 ) {
			showMessage ( divId, "Password too short, minimum 6 characters!", false );			
			return false;
		}
		else {
			$( '#'+divId ).html ( "" );
			ret = true;
		}
		return true;
	}
	
	/*
	 * Validate password (used for reset pass)
	 */
	function validatePass ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, msg, false );
			return false;
		}
		else if ( data.lgrPassword1 != data.lgrPassword2 ) {
			showMessage ( divId, "Passwords do not match!", false );	
			return false;
		}
		else if ( data.lgrPassword1.length < 6 ) {
			showMessage ( divId, "Password too short, minimum 6 characters!", false );	
			return false;
		}
		return true;
	}
	
	/*
	 * Reset password result  
	 */
	function postResetSuccess ( result )
	{
		var respObj = jQuery.parseJSON( result );
		if ( respObj.status == 'OK') {
			$('#login-ui').html ( '<div style="font-size:115%;padding:10px;">You password has been reset successfully! <br><br>Please go to the Local5 app and Sign In with your new password.</div>' );
			//showMessage ( 'lgrMsg', "Reset Successful. Go to the app and Sign In", true );			
		}
		else {
			$('#login-ui').html ( '<h2 style="font-size:115%;padding:10px;">You password reset has failed! <br><br>Please try the reset again from the Local5 app.</div>' );			
			//showMessage ( 'lgrMsg', "Reset Password Failed" );						
		}
		// close current dialog
		showWaiting ( false );
	}
	
	/*
	 * successful postSuccess to server
	 */
	function authResult ( status, respObj )
	{
		// login success
		if ( status == 'OK') {
			showMessage ( lastErrDivId, "Successful", true);
			
			// close current dialog
			showWaiting ( false );
			
			// postSignIn: fire postSignIn event to home
			//SA.fireEvent('home', {cmd:'postSignIn'} );
			var homeComp = SA.lookupComponent ( 'home' );
			homeComp.handleEvent ( {cmd:'postSignIn'} );
		}
		else {
			if ( respObj.error == 'USERNAME_EXISTS' ) {
				showMessage ( lastErrDivId, "Username already exists!", false);
			}
			else {
				showMessage ( lastErrDivId, "Authentication failure!", false);
			}
			showWaiting ( false );
		}
	}
	
	/**
	 * Show auth result message
	 */
	function showMessage ( name, msg, success )
	{
		var msgComp = SA.comps.getCompByName ( name );
		msgComp.showMessage ( msg, success );
	}
}

;
/**
 * Display card of information
 */
App.util = function ()
{
	/**
	 * Change color Luminance value
	 * 
	 * Examples:
	 * ColorLuminance("#69c", 0);		// returns "#6699cc"
	 * ColorLuminance("6699CC", 0.2);	// "#7ab8f5" - 20% lighter
	 * ColorLuminance("69C", -0.5);		// "#334d66" - 50% darker
	 * ColorLuminance("000", 1);		// "#000000" - true black cannot be made lighter!
	 */
	this.colorLuminance = function (hex, lumPer) 
	{
		// validate hex string
		hex = String(hex).replace(/[^0-9a-f]/gi, '');
		if (hex.length < 6) {
			hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
		}
		lumPer = lumPer || 0;

		// convert to decimal and change luminosity
		var rgb = "#", c, i;
		for (i = 0; i < 3; i++) {
			c = parseInt(hex.substr(i*2,2), 16);
			c = Math.round(Math.min(Math.max(0, c + (c * lumPer)), 255)).toString(16);
			rgb += ("00"+c).substr(c.length);
		}

		return rgb;
	}
	
	/**
	 * Find an item in list
	 */
	this.getListItem = function ( name, listObj)
	{
		var items = listObj.items;
		if ( items && items.length>0 ) {
			var i;
			for ( i=0; i<items.length; i++ ) {
				if ( name == items[i].name )
					return items[i];
			}
		}
	}
	
	/**
	 * Merges a list object with data object
	 */
	this.mergeList = function ( listObj, dataObj ) 
	{
		var items = listObj.items;
		if ( items && items.length > 0 ) {
			
			var j = 0;
			for ( j=0; j<items.length; j++ ) {
				var obj = items [j];
				
				// if atom
				if ( obj.name ) {
					var val = dataObj [ obj.name ];
					if ( val && val!='~nv') {
						obj.value = val;
					}
					else {
						obj.value = '';
					}
				}
			}
		}
	}
	
	/**
	 * Gets user group id
	 */
	this.getGroupId = function ()
	{
		var auth = SA.getUserAuth ().respData;
		return auth.groupId;
	}
	
	/**
	 * Get userId from logged in auth object
	 */
	this.getUserId = function ()
	{
		var auth = SA.getUserAuth ().respData;
		return auth.email;
	}
	
	/**
	 * Return true if can admin service
	 */
	this.canAdminSvc = function ( serviceId, groupId )
	{
		var canAdmin = false;
		
		var auth = SA.getUserAuth ().respData;
		
		// all members of Participation group can admin services for the group
		if ( groupId && auth.groupId && groupId==auth.groupId ) {
			canAdmin = true;
		}
		else {
			var svcList = auth.adminSvcs;
			if ( svcList == 'SUPER-USER' )
				canAdmin = true;
			else 
				canAdmin = svcList.indexOf ( serviceId ) >= 0;
		}
		return canAdmin;
	}
	
	/**
	 * Allow admin for service id (because it was just added by me)
	 */
	this.canAdminSvcAllow = function ( serviceId )
	{
		var auth = SA.getUserAuth ();
		var svcList = auth.respData.adminSvcs;
		if ( svcList.indexOf ( serviceId ) < 0 ) {
			auth.respData.adminSvcs += ',' + serviceId;
		} 
		SA.setUserAuth ( auth );
	}
	
	/**
	 * Open url in new window
	 */
	this.openUrlInWindow = function ( url )
	{
		window.open(url,'_system');
	}
	
	/**
	 * Return true if URL is TTF image URL
	 */
	this.isImageUrl = function ( url )
	{
		return url.indexOf ( '/media/' ) > 0;
	}

	/**
	 * Get friendly time
	 */
	this.getFriendlyTime = function ( timeMs )
	{
		var timeNowMs = new Date().getTime();
		var diffSec = (timeNowMs - timeMs) / 1000;
		if ( diffSec < 60 ) {
			return Math.round(diffSec) + ' seconds ago';
		}
		else if ( diffSec < 3600 ) {
			return Math.round(diffSec/60) + ' minutes ago';
		}
		else if ( diffSec < 86400 ) {
			return Math.round(diffSec/3600) + ' hours ago';
		}
		else if ( diffSec < 604800 ) {
			return Math.round(diffSec/86400) + ' days ago';
		}
		else {
			return Math.round(diffSec/604800) + ' weeks ago';
		}
	}
	
	/**
	 * Gets user name info for logged in user
	 */
	this.getMyNameInfo = function ()
	{
		var auth = SA.getUserAuth ();
		var name = '';
		
		if (auth ) {
			auth = auth.respData;
			if (auth.firstName) {
				name += auth.firstName;
				if ( auth.lastName ) {
					name += ' ' + auth.lastName;
				}
			}
			if ( name.length < 3 ) {
				var idx = auth.email.indexOf ('@');
				if (idx > 0 ) {
					name = auth.email.stubstring (0, idx);
				}
			}
		}
		return name;
	}
	
	/**
	 * Return true if running as mobile app
	 */
	this.isMobileApp = function ()
	{
		var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
		if ( app ) {
			return true;
		} else {
		    return false;
		}  
	}
	
	/**
	 * Get media URL
	 */
	this.getMediaUrl = function ( imgIdOrUrl )
	{
		if ( imgIdOrUrl.indexOf( 'http' ) == -1 ) {
			return SA.server.getMediaUrl ( imgIdOrUrl );
		} 
		return imgIdOrUrl;
	}
	
	/**
	 * Strip tags from input string
	 */
	this.safeHtml = function (input) 
	{
		var strippedText = undefined;
		if ( input ) {
			strippedText = input.replace(/<\/?[^>]+(>|$)/g, "");
		}
		return strippedText;
	}
	
	/**
	 * Parse name from First Last name string (cap first letter of name)  
	 */
	this.getName = function ( name, isFirst )
	{
		var idx = name.indexOf ( ' ' );
		var ret = name;
		if ( isFirst == true ) {
			if (idx > 0 )  {
				ret = name.substring (0, idx);
			}
		}
		else {
			ret = '';
			if ( idx > 0 ) { 
				ret = name.substring (idx);
			}
		}
		ret = ret.trim ();
		if ( ret.length > 0 ) {
			return ret[0].toUpperCase() + ret.substr(1);
		}
		return ret;
	}

	/**
	 * Get main component
	 */
	this.getMainComp = function ()
	{
		var main = SA.lookupComponent ( '_main' );
		return main;
	}

	/**
	 * Start loading 
	 */
	this.startWorking = function ()
	{
		var load = SA.lookupComponent ('loading');
		load.start();
	}
	
	/**
	 * Start loading 
	 */
	this.stopWorking = function ()
	{
		var load = SA.lookupComponent ('loading');
		load.stop();
	}
	
	//// User Data Object
	var userDataObj = undefined;
	
	/**
	 * Return user data object
	 */
	this.getUserData = function ()
	{
		if ( !userDataObj ) {
			userDataObj = SA.getAppData ( 'userDataObj' );
			if ( !userDataObj ) {
				userDataObj = {};
			}
			else {
				userDataObj = jQuery.parseJSON( userDataObj );
			}
		}
		return userDataObj;
	}
	
	/**
	 * Set new value for user data object
	 */
	this.setUserDeviceId = function ( deviceId )
	{
		userDataObj ['deviceId'] = deviceId;
		SA.setAppData ( 'userDataObj', JSON.stringify (userDataObj) );
	}
	
	/**
	 * Increment badge nunber for service id (if inc==false, clear)
	 */
	this.setUserBadge = function ( serviceId, inc )
	{
		App.util.getUserData();
		if (inc == true ) {
			var num = userDataObj [serviceId];
			if ( !num )
				num = 1;
			else 
				num++;
			userDataObj [serviceId] = num;
		}
		else {
			userDataObj [serviceId] = 0;
		}
		SA.setAppData ( 'userDataObj', JSON.stringify (userDataObj) );
	}
	
	/**
	 * Clear user data object
	 */
	this.delUserData = function ()
	{
		SA.deleteAppData ( 'userDataObj' );
		userDataObj = undefined;
	}
		
}

App.util = new App.util();
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.FlexAdmin = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var currentDlg = undefined;
	var curSvcDivId, curSvcLatestConf, curMappComp;
	var serviceComp = undefined;
	
	var initialized = false; 
	
	/**
	 * Group flow list
	 */
	var groupForm = {name:'flex_add_form', lc:'App.FormHandler', 
		config:{title:'Add new group', listener:this, pageStyle:true}, items: 
		[
		{html:'div', style:'height:5px;'},		
		{html:'div', style:'font-size:140%', value:'Group Handler'},		
		
		{name:'flex_msg', ac:'App.Message' },
		
		{html:'div', style:'height:8px;'},		

		{name:'flex_id', ac:'App.Variable'},

		// business address
		{name:'flex_name', ac:'App.TextField', info:'Participation Group Name', required:true, pattern:'text' },
		{name:'flex_dispName', ac:'App.TextField', info:'Group Label', required:true, pattern:'text' },
		{name:'flex_dispStyle', ac:'App.TextField', info:'Group CSS Style', required:false, pattern:'text' },
		
		// Save changes
		{html:'div', style:'height:5px;'},	
		{cmd:'flex_cmd_save', ac:'App.Button', label:'Save Changes'}
		]
	};
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * qstr: query string
	 */
	this.createUI = function ( parentList, config )
	{
		myId = this.compId;
		myInst = this;
		
		var qstr = SA.getConfig ( parentList, 'qstr' );
		if ( qstr && qstr.length>0 ) {
			var i = qstr.indexOf ('id=');
			if ( i == 0 ) {
				SA.fireEvent ( myId, {cmd:'loadData', id:qstr.substring(3), kind:'group'} );
			}
		}
		return SA.createUI ( myId, groupForm );
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'flex_cmd_save' ) {
			if ( validate ( 'flex_msg', atomList, dataObj ) ) {
				var form = getForm ( dataObj );
				if ( dataObj.flex_id && dataObj.flex_id > 0 ) { 
					SA.server.putForm ("/rs/group", form, postSuccess);
				}
				else { 
					SA.server.postForm ("/rs/group", form, postSuccess);
				}
			}
		}
	}
	
	/*
	 * Convert object to form
	 */
	function getForm ( dataObj ) 
	{
		var form = new FormData();
		
		for ( var key in dataObj ) {
			
			var i = key.indexOf ('flex_');
			if ( i == 0 ) {
				var val =  dataObj [key];
				if ( val ) {
					form.append ( key.substring(5), val );
				}
			}
		}
		return form;
	}
	
	/*
	 * Success after adding service 
	 */
	function postSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		if ( respObj.status == 'OK') {
			showMessage ( 'flex_msg', 'Service added successfully', true );
			
			// go back to main page
			var banner = SA.lookupComponent ( 'banner' );
			banner.showPrev ();
		}
		else {
			showMessage ( 'flex_msg', respObj.message, false );
		}
	}
	
	/*
	 * Validate function
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, msg, false );
			return false;
		}
		return true;
	}
	
	/*
	 * showMessage
	 */
	function showMessage ( name, msg, success )
	{
		var msgComp = SA.comps.getCompByName ( name );
		msgComp.showMessage ( msg, success );
	}
	
	/**
	 * Called to handle events specific for this component
	 */
	this.handleEvent = function ( event )
	{
		if ( event.cmd == 'loadData' ) {
			var id = event.id;
			var kind = event.kind;
			SA.server.get ('/rs/' + kind, {id:id}, dataHandler );
			
			function dataHandler ( data ) 
			{
				var respObj = jQuery.parseJSON( data );
				
				if ( respObj.status == 'OK') {
					
					var dataObj = respObj.respData;
					var listObj = {};
					
					for ( var key in dataObj ) {
						listObj [ 'flex_' + key ] = dataObj [key];
					}
					
					var form = SA.lookupComponent ('flex_add_form');
					form.updateForm ( listObj );
				}
				else {
					showMessage ( 'flex_msg', respObj.message, false );
				}
			}				
		}
	}
	
	/**
	 * After compoent is loaded in page  
	 */
	this.postLoad = function ()
	{	
	}
}
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.SvcAdmin = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var currentDlg = undefined;
	var curSvcDivId, curSvcLatestConf, curMappComp;
	var serviceComp = undefined;
	
	var initialized = false;
	
	/**
	 * Service flow list
	 */
	var serviceList = {name:'service-add-form', lc:'App.FormHandler', 
		config:{title:'Add new service', listener:this, pageStyle:true}, items: 
		[
		//{html:'div', style:'height:5px;'},		
		{name:'svc-add-Msg', ac:'App.Message' },
		
		{html:'div', style:'height:8px;'},		

		{name:'id', ac:'App.Variable'},

		{name:'title', ac:'App.TextField', info:'Service title', required:true, pattern:'text' },
		{name:'titleColor', ac:'App.TextField', info:'Title color value', required:true, pattern:'text' },
		//{name:'titleBG', ac:'App.TextField', info:'Title background value', required:true, pattern:'text' },
		
		// size: 325 x 280
		{name:'iconUrl', ac:'App.UploadSmpl', info:'Icon image', required:false, 
			config:{prefWidth:325, prefHeight:280} },
		{html:'div', style:'color:gray;margin-bottom:5px;font-size:85%', value:'Note: use fingers to move and resize photo' }, 
			
		{name:'iconBG', ac:'App.TextField', info:'Icon background color value', required:true, pattern:'text' },

		// business info
		//{name:'info', ac:'App.TextArea', info:'Description (optional)', required:false, pattern:'text' },

		// business address
		{name:'address', ac:'App.TextField', info:'Service street address', required:true, pattern:'text' },
		{name:'city', ac:'App.TextField', info:'City', required:true, pattern:'text' },
		{name:'state', ac:'App.TextField', info:'State', required:true, pattern:'text' },
		{name:'zip', ac:'App.TextField', info:'Zip code', required:true, pattern:'text' },		
		{name:'country', ac:'App.TextField', info:'Country (optional)', required:false, pattern:'text' },
		
		// associated component
		/*
		{name:'compName', ac:'App.TextField', info:'Component object name (optional)', required:false, pattern:'text' },
		{name:'compDef', ac:'App.TextArea', info:'Component definition (optional)', required:false, pattern:'text' },
		{name:'compConfig', ac:'App.TextArea', info:'Component config (optional)', required:false, pattern:'text' },
		*/
		
		// Admin email list 
		{name:'adUserIds', ac:'App.TextArea', info:'Admin emails seperated by ,  (optional: you are the admin by default)', pattern:'text',
			config:{rows:3} },
		
		{html:'div', style:'color:gray;margin-top:15px;margin-bottom:5px;font-size:85%', 
			value:'Tap to toggle select options below:' }, 
		{name:'showComm', ac:'App.ButtonYN', label:'Show Comments', style:'font-size:80%' },
		{name:'showPoster', ac:'App.ButtonYN', label:'Show Poster', style:'font-size:80%;margin-left:5px;' },
		
		// Save changes
		{html:'div', style:'height:20px;'},
		{cmd:'cmdNewService', ac:'App.Button', label:'Save Changes'}
		]
	};
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * qstr: query string
	 */
	this.createUI = function ( parentList, config )
	{
		myId = this.compId;
		myInst = this;
	}
	
	/**
	 * Administer a service 
	 */
	this.adminService = function ()
	{
		var svcSearch = SA.lookupComponent ('svcSearch');
		svcSearch.showForSignedIn ('Add or Modify Service Icons', myInst)
	}

	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdNewService' ) {
			showWaiting (true);
			if ( validate ( 'svc-add-Msg', atomList, dataObj ) ) {
				var form = getForm ( dataObj );
				if ( dataObj.id && dataObj.id > 0 ) { 
					SA.server.putForm ("/rs/service", form, postSuccess);
				}
				else { 
					SA.server.postForm ("/rs/service", form, postSuccess);
				}
			}
			else {
				showWaiting (false);
			}
		}
	}
	
	/*
	 * getSvcSuccess
	 */
	function querySvcSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		if ( respObj.status == 'OK') {
			if (respObj.respData ) {
				var data = respObj.respData;
				
				var imgUrl = data.iconUrl;
				var comp = App.util.getListItem ('iconUrl', serviceList );
				comp.config.imgUrl = imgUrl;
				
				data.iconUrl = undefined;
				App.util.mergeList (serviceList, data );
				
				var html = SA.createUI ( myInst, serviceList);
				App.util.stopWorking ();
				
				var banner = SA.lookupComponent ( 'banner' );
				banner.showNext ( 'adminSvc', 'Modify Existing Service', html, true );
			}
		}
		showWaiting (false);		
	}

	/**
	 * Enable / disable form wait
	 */
	function showWaiting ( isWaiting )
	{
		var comp = SA.lookupComponent ('service-add-form');
		if ( isWaiting == true ) {
			comp.setWaiting ( true );
		}
		else {
			comp.setWaiting ( false );
		}
	}	
	
	/*
	 * Convert object to form
	 */
	function getForm ( obj ) 
	{
		var form = new FormData();
		form.append ('title', obj.title );
		if (  obj.titleColor )
			form.append ('titleColor', obj.titleColor);
		if ( obj.titleBG )
			form.append ('titleBG', obj.titleBG);
		
		if ( obj.iconUrl  )
			form.append ('iconUrl', obj.iconUrl );
		if ( obj.iconBG )
			form.append ('iconBG', obj.iconBG );
		
		if ( obj.info  )
			form.append ('info', obj.info );
		
		if ( obj.adUserIds ) 
			form.append ('adUserIds', obj.adUserIds );
		
		form.append ('address', obj.address );
		form.append ('zip', obj.zip );
		form.append ('city', obj.city );
		
		if ( obj.state )
			form.append ('state', obj.state );
		
		if ( obj.country)
			form.append ('country', obj.country );
		
		if ( obj.id ) 
			form.append ('id', obj.id );
		
		if ( obj.compName && obj.compName.length>0 )
			form.append ('compName', obj.compName );
		else 
			form.append ('compName', '~nv' );
		
		if ( obj.compDef && obj.compDef.length>0 )
			form.append ('compDef', obj.compDef )
		else
			form.append ('compDef', '~nv' );
			
		if ( obj.compConfig && obj.compConfig.length>0 )
			form.append ('compConfig', obj.compConfig )
		else 
			form.append ('compConfig', '~nv' );		
		
		// get my group id
		form.append ( 'groupId', App.util.getGroupId() );
		form.append ( 'showComm', obj.showComm );
		form.append ( 'showPoster', obj.showPoster );
		
		return form;
	}
	
	/*
	 * Success after adding service 
	 */
	function postSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		if ( respObj.status == 'OK') {
			showMessage ( 'svc-add-Msg', 'Service added successfully', true );
			
			// ALLOW: to  edit the service i just added (on the front-end)
			App.util.canAdminSvcAllow ( respObj.respData.id );
			
			// clear user services
			//var dm = SA.lookupComponent ('dataManager');
			//dm.clearUserServices ();
			
			// go back to main page
			var banner = SA.lookupComponent ( 'banner' );
			banner.showPrev ();
		}
		else {
			showMessage ( 'svc-add-Msg', respObj.message, false );
		}
	}
	
	/*
	 * Validate function
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, msg, false );
			return false;
		}
		return true;
	}
	
	/*
	 * showMessage
	 */
	function showMessage ( name, msg, success )
	{
		var msgComp = SA.comps.getCompByName ( name );
		msgComp.showMessage ( msg, success );
	}
	
	/**
	 * Called when clicking on action buttons or from other components
	 * 
	 * event = {cmd:'', config:sconf}
	 */
	this.performAction = function (  action  )
	{
		// update form list with data before showing the dialog
		var formComp = SA.lookupComponent ('svc-find-form');
		
		// for edit user listId and cardId
		if ( action.cmd == 'svcNew' ) {
			App.util.mergeList (serviceList, {} );
			var comp = App.util.getListItem ('iconUrl', serviceList );
			comp.config.imgUrl = '';
			var html = SA.createUI ( myInst, serviceList);
			var banner = SA.lookupComponent ( 'banner' );
			banner.showNext ( 'adminSvc', 'Add Service', html, true );
		}
		else if ( action.cmd == 'svcEdit' ) {
			var sconf = action.config;
			App.util.startWorking ();
			SA.server.get ( "/rs/service", {id:sconf.id}, querySvcSuccess);
		}
	}

	/**
	 * Called to handle events specific for this component
	 */
	this.handleEvent = function ( event )
	{
		if ( event.cmd == 'showLatest' ) {
			
		}
	}
	
	/**
	 * After compoent is loaded in page  
	 */
	this.postLoad = function ()
	{	
		$( '.list-group-item' ).hammer().bind("tap", function(event) {

		});
		
		// Prev page 
		$('#' + myId ).hammer().bind( "swiperight", function( event ) {
			//console.log ( 'swipe -->' );
			if ( !accept (event) ) return;			
			//console.log ( 'swipe --> ts: ' + event.timeStamp );
			var pages = SA.lookupComponent ( 'banner' );
			pages.showPrev ();
		});	
		
		// accept event
		function accept (event ) {
			var ret = event.timeStamp > lastTime;
			lastTime = event.timeStamp;
			return ret;
		}		

		
	}
}
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.UserAdmin = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var currentDlg = undefined;
	var curSvcDivId, curSvcLatestConf, curMappComp;
	var serviceComp = undefined;
	
	var initialized = false;
	
	/**
	 * Service flow list
	 */
	var myAcctList = {name:'create-acct-form', lc:'App.FormHandler', 
		 	config:{title:'Create New Account', listener:this, pageStyle:true}, items: 
		 [
		 {name:'changeAcctMsg', ac:'App.Message' },
		 {html:'div', style:'height:5px' },
		  
		 // 1: Change name
		 {html:'div', value:'Change Name:', Style:'font-size:120%' },
		 {html:'div', style:'height:5px;'},

		 {name:'personalName', value:'', ac:'App.TextField', 
			 info:'Name: First Last', pattern:'text', required:true },

		 {html:'div', style:'height:15px;'},		 
		 {html:'div', style:'width:100%;height:10px;border-top:solid silver 1px;'},
		 {html:'div', style:'height:10px;'},
		 
		 // 2: Security info
		 {html:'div', name:'loginEmail', value:'', style:'font-size:100%'},
		 {html:'div', style:'height:5px;'},

		 {html:'div', value:'Change Password:', Style:'font-size:120%;margin-top:10px' },
		 {html:'div', style:'height:5px;'},
		 
		 {name:'oldPass', ac:'App.TextField', info:'Old Password', config:{type:'password'},
				 required:false, pattern:'text' },
		 {name:'newPass', ac:'App.TextField', info:'New Password', config:{type:'password'},
			 required:false, pattern:'text' },
			 
		 {html:'div', style:'height:5px;'},

		 {html:'div', style:'border-top:solid silver 1px;padding-top:10px', 
			 value:'<a target="_blank" href="app/res/text/EULA.html">View End User License Agreement..</a>'},
		 
		 {html:'div', style:'height:10px;'},
		 {html:'div', style:'width:100%;height:10px;border-top:solid silver 1px;'},
		 
		 // 3: Participation Group
		 {html:'div', value:'Participation Group:', Style:'font-size:120%;margin-top:10px' },
		 {html:'div', style:'height:5px;'},
		 {name:'groupName', ac:'App.TextField', info:'Enter Group Name (optional)',  config:{type:'password'},
			 required:false, pattern:'text' },
			 
		 {html:'div', style:'font-size:75%', 
				 value:'Allows members to join the private group. You need to sign out and back in to be part of the group.'},
				 		 		 
		 {html:'div', style:'height:20px;'},
		 {cmd:'cmdSaveMyAccount', ac:'App.Button', label:'Save Changes'}		 
		 ]
	 };
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * qstr: query string
	 */
	this.createUI = function ( parentList, config )
	{
		myId = this.compId;
		myInst = this;
	}
	
	/**
	 * Create and return admin UI
	 */
	this.getAdminUI = function ()
	{
		var obj = {}
		var auth = SA.getUserAuth().respData;
		
		obj.personalName = auth.firstName + ' ' + auth.lastName;
		obj.loginEmail = 'User Id: ' + auth.email;
		obj.groupName = auth.groupId;
		App.util.mergeList ( myAcctList, obj);
		
		var html = '<div id="' + myId + '" style="background-color:white">' + 
					SA.createUI ( myId, myAcctList) + '</div>';
 		return html;
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		// NOTE: ABsolete code NOT USED!!
		if ( actionAtom.cmd == 'cmdShowAgreement' ) {
			var ban = SA.lookupComponent ('banner');
			var comp = SA.createComponent ( 'ttf-frame', 'App.LinkFrame' );
		    var html = comp.createUI ('', {srcUrl:'app/res/text/EULA.html'} );
		    // TODO: banner.showSinglePage() is no longer used 
			ban.showSinglePage ( true, html );
		}
		else if ( actionAtom.cmd == 'cmdSaveMyAccount' ) {
			if ( validate ('changeAcctMsg', dataObj ) == true ) { 
				var form = getForm ( dataObj );
				SA.server.postForm ("/rs/admin", form, postSuccess);
			}
		}
	}
	
	/*
	 * Success after adding service 
	 */
	function postSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		if ( respObj.status == 'OK') {
			showMessage ( 'changeAcctMsg', 'Changes Saved Successfully', true );
			
			updateSessionInfo ( respObj.respData );
			
			// go back to main page
			var banner = SA.lookupComponent ( 'banner' );
			banner.showPrev ();
		}
		else {
			showMessage ( 'changeAcctMsg', respObj.message, false );
		}
	}
	
	/**
	 * Update changes in session
	 */
	function updateSessionInfo ( respData )
	{
		if ( respData ) {
			var userAuth = SA.getUserAuth();
			var authObj = userAuth.respData;
			if ( respData.loginToken && respData.loginToken.length>0 ) {
				authObj.loginToken = respData.loginToken;
			}
			if ( respData.firstName && respData.firstName.length>0 ) {
				authObj.firstName = respData.firstName;
				authObj.lastName = respData.lastName;
			}
			authObj.groupId = respData.groupId;
			SA.setUserAuth ( userAuth );
		}
	}
	
	/*
	 * Validate login form
	 */
	function validate ( divId, data )
	{
		if ( isEmpty(data.personalName) ) {
			showMessage ( divId, '"Name: First Last" cannot be empty!', false );			
			return false;	
		}
		
		if ( !isEmpty(data.oldPass) && isEmpty(data.newPass) ) {
			showMessage ( divId, "Invalid old password", false );			
			return false;	
		}
		
		if ( !isEmpty(data.newPass) ) {
			if (  data.newPass.length < 6 ) {
				showMessage ( divId, "New password too short, minimum 6 characters!", false );			
				return false;
			}
			if ( isEmpty(data.oldPass) || data.oldPass.length < 6  ) {
				showMessage ( divId, "Invalid old password", false );			
				return false;				
			}
		}
		else {
			$( '#'+divId ).html ( "" );
			ret = true;
		}
		return true;
	}
	
	/*
	 * showMessage
	 */
	function showMessage ( name, msg, success )
	{
		var msgComp = SA.comps.getCompByName ( name );
		msgComp.showMessage ( msg, success );
	}

	/*
	 * Convert object to form
	 */
	function getForm ( obj ) 
	{
		var form = new FormData();
		
		if ( !isEmpty(obj.personalName) ) { 
			form.append ( 'firstName', App.util.getName( obj.personalName, true) );
			form.append ( 'lastName', App.util.getName( obj.personalName, false) );			
		}
		
		if ( !isEmpty(obj.groupName) ) 
			form.append ( 'groupName', obj.groupName );		
		else 
			form.append ( 'groupName', '' );	
		
		if ( !isEmpty(obj.oldPass) ) {
			form.append ( 'oldPass', obj.oldPass);
			form.append ( 'newPass', obj.newPass);
		}
		return form;
	}
	
	/**
	 * Return true if field is empty
	 */
	function isEmpty ( field )
	{
		return !field || field.length==0;
	}
	
	/**
	 * After compoent is loaded in page  
	 */
	this.postLoad = function ()
	{
	}
}
;/**
 * Data manager to handle caching / etc
 */
App.DataManager = function ()
{
	var compId = 20000;

	// DB: services list 
	var cacheTable = 
		[
		{data:undefined, lastSec:0, ttlSec:60}
		];
	
	// DB: user-services test list  (pre-fill for testing)
	var userServiceList = [];	
	
	// Array of objects, caches all service feeds: 
	// {serviceId:id, lastSec:now-sec, data:feed-data}
	var serviceFeedsCache = {};
	var serviceFeedTTL = 60;
	var groupDataCache = {};
	
	/**
	 * Auth: login 
	 */
	this.authLogin = function ( data, authHandler )
	{
		SA.server.get("/rs/user", data, dataResult);
		
		function dataResult ( respStr )
		{
			//console.log ( 'calling server: result: ' + respStr);
			
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				
				// set auth to user info
				SA.setUserAuth ( respObj );
				
				// set username in app data
				SA.setAppData ( 'userName', respObj.respData.email );	
				// del user data object 
				App.util.delUserData ();
				
				_clearUserServices();
				_clearServicesCache();
				
				authHandler ('OK', respObj );
			}
			else {
				authHandler (respObj.status, respObj );
			}
		}
	}
	
	/**
	 * Auth: create a new account 
	 */
	this.authCreateAcct = function ( data, authHandler )
	{
		SA.server.set ("/rs/user", data, dataResult);
		function dataResult ( respStr )
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				
				// set auth to user info
				SA.setUserAuth ( respObj );
				
				// set username in app data
				SA.setAppData ( 'userName', respObj.respData.email );
				// del user data object 
				App.util.delUserData ();
				
				_clearUserServices();
				_clearServicesCache();
				
				authHandler ('OK', respObj );
			}
			else {
				authHandler (respObj.status, respObj );
			}
		}
	}
	
	/**
	 * Auth: email reset password
	 */
	this.authEmailReset = function ( data, authHandler )
	{
		SA.server.set ("/rs/feedback", data, dataResult);	
		function dataResult ( respStr )
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				authHandler ('OK', respObj);
			}
			else {
				authHandler (respObj.status, respObj );
			}
		}
	}
	
	/**
	 * Get all services created (owned) by user
	 */
	this.getMyServices = function ( searchObj, dataHandler, cache )
	{
		searchObj.groupId = App.util.getGroupId ();
		SA.server.get("/rs/service", searchObj, dataResult );
		
		function dataResult ( respStr )
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				dataHandler ('OK', respObj.respData );
			}
			else {
				dataHandler (respObj.status, respObj.message );
			}
		}
	}
	
	/**
	 * Gets group data 
	 */
	this.getGroupData = function ( groupId, dataHandler )
	{
		if ( groupDataCache.id && groupDataCache.id>0 ) {
			dataHandler ('OK', groupDataCache );
		}
		else {
			SA.server.get("/rs/group", {id:groupId}, dataResult );			
			function dataResult ( respStr )
			{
				var respObj = jQuery.parseJSON( respStr );
				if ( respObj.status == 'OK') {
					groupDataCache = respObj.respData;
					dataHandler ('OK', respObj.respData );
				}
				else {
					dataHandler (respObj.status, respObj.message );
				}
			}
		}
	}
	
	/**
	 * Gets all services registered in the system
	 */
	this.getServices = function ( searchObj, dataHandler, cache )
	{
		var nowSec = new Date().getTime() / 1000;
		var svcsObject = cacheTable [0];
		
		// cache miss
		if ( (nowSec - svcsObject.lastSec) > svcsObject.ttlSec ) {
			svcsObject.lastSec = nowSec;
			searchObj.groupId = App.util.getGroupId ();
			SA.server.get("/rs/service", searchObj, dataResult );
			
			function dataResult ( respStr )
			{
				var respObj = jQuery.parseJSON( respStr );
				if ( respObj.status == 'OK') {
					svcsObject.data = respObj.respData;
					dataHandler ('OK', svcsObject.data);
				}
				else {
					dataHandler (respObj.status, respObj.message );
				}
			}
		}
		else {
			dataHandler ('OK', svcsObject.data);
		}
	}
	
	/**
	 * Clears the feeds cache for service 
	 */
	this.clearFeedsCache = function ( serviceId )
	{
		_clearFeedsCache ( serviceId );
	}
	
	/*
	 * Interal clear cache function
	 */
	function _clearFeedsCache ( serviceId )
	{
		serviceFeedsCache [serviceId] = undefined;		
	}
	
	/**
	 * Clear the user services cache
	 */
	this.clearUserServices = function ()
	{
		_clearUserServices();
	}
	
	function _clearUserServices ()
	{
		userServiceList.length = 0;		
	}
	
	/*
	 * Clear the services cache
	 */
	function _clearServicesCache ()
	{
		cacheTable [0].lastSec = 0;
	}
	
	/**
	 * DB: Get user service objects as saved in DB
	 * 
	 * userService obj format: {id:user-svc-id, sconf:svc-config, divId:div-id }
	 */
	this.getUserServices = function ( dataHandler )
	{
		// if no dataHandler, return from cache
		if ( !dataHandler ) {
			return userServiceList;
		}
		// if data already loaded return
		else if ( userServiceList.length > 0 ) {
			dataHandler ( 'OK', userServiceList );			
		}
		// load data 
		else {
			SA.server.get("/rs/userService", {}, userSvcResult );
			
			function userSvcResult (respStr)
			{
				var respObj = jQuery.parseJSON( respStr );
				if ( respObj.status == 'OK') {
					var data = respObj.respData;
					for (i=0; i<data.length; i++ ) {
						var sobj = {id:data[i].id, sconf:data[i].service, divId:''};
						addUserServiceObj ( sobj );
					}
					dataHandler ('OK', data );					
				}
				else {
					dataHandler (respObj.status, respObj.message );
				}
			}
		}
	}
	
	/**
	 * Gets service by id from cache
	 */
	this.getService = function ( serviceId )
	{
		for ( var i=0; i<userServiceList.length; i++ ) {
			if ( userServiceList[i].sconf.id == serviceId ) {
				return userServiceList[i].sconf;
			}
		}
	}
	
	/**
	 * Remove userService by id
	 */
	this.delUserService = function ( id, dataHandler )
	{				
		var idx = getUserServiceIdx ( id );
		if ( idx >= 0 ) {
			SA.server.del ("/rs/userService", {id:id}, delResult );
		}
		// del result 
		function delResult (respStr)
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				userServiceList.splice (idx, 1);
				dataHandler ('OK', respObj.respData );
			}
			else {
				dataHandler (respObj.status, respObj.message );
			}
		}
	}
	
	/**
	 * Find a user-based service by div id
	 */
	this.getUserServiceByDivId = function ( divId )
	{
		return getUserServiceObj (divId);
	}
	
	/**
	 * DB: Add user service config object (and optionally map to divId )
	 */
	this.registerDeviceId = function ( deviceId, resultFn )
	{
		// data to update
		var postData = {deviceId:deviceId, userId:App.util.getUserId()};
		
		SA.server.set ('/rs/device', postData, dataesult );
		function dataesult ( respStr )
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				var data = respObj.respData;
				resultFn ('OK',  data );
			}
			else {
				resultFn (respObj.status,  respObj.message );
			}
		}				
	}
	
	/**
	 * DB: Add user service config object (and optionally map to divId )
	 */
	this.setUserService = function ( divId, sConfig, resultFn )
	{
		// data to update
		var postData = {serviceId:sConfig.id};
		
		// get existing service conf object (if any)
		var userSvcObj = getUserServiceObj ( divId );
		if ( userSvcObj ) {
			postData.id = userSvcObj.id;
		}
		
		SA.server.set ('/rs/userService', postData, setSvcResult );
		
		function setSvcResult ( respStr )
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				var data = respObj.respData;
				
				// if existed in cache userSvcObj
				if ( userSvcObj ) {
					userSvcObj.sconf = sConfig;
				}
				else {
					userSvcObj = {id:data.id, sconf:sConfig, divId:divId };
					addUserServiceObj (userSvcObj);
				}
	
				// notify caller about result 
				resultFn ('OK',  data );
			}
		}
	}
	
	/**
	 * Maps an existing user service to service icon
	 */
	this.mapUserServiceToIcon = function ( divId, userSvcObj )
	{
		userSvcObj.divId = divId;
	}
	
	/**
	 * Get userService object by divId (if exists), otherwise undefined
	 * obj format: {id:data.id, sconf:sConfig, divId:divId }
	 */
	function getUserServiceObj (divId)
	{
		for (i=0; i<userServiceList.length; i++ ) {
			if (divId == userServiceList[i].divId ) {
				return userServiceList[i]
			}
		}
		return undefined;
	}
	
	/**
	 * Get userService object by id (if exists), otherwise -1
	 * obj format: {id:data.id, sconf:sConfig, divId:divId }
	 */
	function getUserServiceIdx ( id )
	{
		for (i=0; i<userServiceList.length; i++ ) {
			if (id == userServiceList[i].id ) {
				return i;
			}
		}
		return -1;
	}
	
	/**
	 * Add to user service object list 
	 * obj format: {id:data.id, sconf:sConfig, divId:divId }
	 * 
	 * @param userSvcObj
	 */
	function addUserServiceObj (userSvcObj)
	{
		userServiceList.push (userSvcObj);
	}
	
	/**
	 * Save a new posting
	 * 
	 * form:
	 * { id:<postId>, 
	 *   msg:'', 
	 *   mediaIdList:array<files>, 
	 *   msgList:array, 
	 *   serviceId:id 
	 * };
	 * 
	 */
	this.savePosting = function ( formData, dataHandler, isUpdate )
	{
		if ( isUpdate == true )
			SA.server.putForm ("/rs/post", formData, postResult);
		else 
			SA.server.postForm ("/rs/post", formData, postResult);
		
		function postResult ( respStr )
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				dataHandler ('OK', respObj.respData);
			}
			else {
				dataHandler (respObj.status, respObj.message );
			}
		}
	}
	
	/**
	 * Delete posting by id
	 */
	this.delPosting = function ( serviceId, postId, dataHandler )
	{
		if ( postId ) {
			SA.server.del ("/rs/post", {id:postId}, delResult );
			function delResult ( respStr )
			{
				var respObj = jQuery.parseJSON( respStr );
				if ( respObj.status == 'OK') {
					_clearFeedsCache ( serviceId );
					dataHandler ( 'OK', respObj.respData);
				}
			}
		}
	}
	
	/**
	 * Lookup data posting by Id 
	 */
	this.getPostingById = function ( serviceId, postId )
	{
		var feed = serviceFeedsCache [serviceId];
		if ( feed ) {
			var i;
			var data = feed.data;
			for ( i=0; i<data.length; i++  ) {
				if ( data[i].id == postId ) {
					return data[i];
				}
			}
		}
		return undefined;
	}
	
	/**
	 * Gets latest postings data feed per service (cache is 60 seconds)
	 */
	this.getLatestFeed = function ( serviceId, dataHandler )
	{
		var feed = serviceFeedsCache [serviceId];
		var nowSec = new Date().getTime() / 1000;
		
		if ( !feed || ((nowSec-feed.lastSec) > serviceFeedTTL) ) {
			if ( !feed ) {
				feed = {};
				serviceFeedsCache [serviceId] = feed;
			}
			SA.server.get("/rs/post", {serviceId:serviceId}, dataResult );
			//console.debug ( 'load data for serviceId: ' + serviceId);
			
			function dataResult ( respStr )
			{
				var respObj = jQuery.parseJSON( respStr );
				if ( respObj.status == 'OK') {
					var data = respObj.respData;
					feed.data = data;
					feed.lastSec = new Date().getTime() / 1000;
					dataHandler ('OK', data);
				}
				else {
					dataHandler (respObj.status, respObj.message );
				}
			}	
		}
		else {
			dataHandler ('OK', feed.data);
		}
	}
}



;/**
 * The App.MAppList component. 
 */
App.MappList = function ()
{
    // Application Global Styles
    this.css =  { items:
    	[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.mapp', value:'border-radius: 10px;'}			 
			]
		},
		 
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.mapp', value:'border-radius: 10px;'}			 
			]
		}    	 
    	]
    };	
	
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var myDivId = undefined;
	var serviceComp = undefined;
	var dataManager = undefined;
	
	// some sizes
	var pgMargin = 20;
	var tileGap = 20;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * param name: imageUrl
	 * param name: ilists
	 *  
	 */
	this.createUI = function ( parentList, config )
	{
		myId = this.compId;
		myInst = this;

		myDivId = 'mapp-' + myId;
		
		serviceComp = SA.createComponent ( 'service', 'App.Service' );
		dataManager = SA.lookupComponent ( 'dataManager' );

		var pghtml = showAllSvcs (dataManager.getUserServices().length, 10 );
		
		// fire event to map user services to icons
		if ( dataManager.getUserServices().length>0 ) {
			SA.fireEvent ( myId, {cmd:'mapUserSvcs'} );
		}
		
		var html = '<div id="' + myDivId + '" >' + pghtml + '</html>';
		return html;
	}
	
	/*
	 * Show all services
	 */
	function showAllSvcs ( svcCount, svcExtra )
	{
		var count = svcCount + svcExtra;
		var winWidth = $(window).width();
		var width = winWidth - ( pgMargin * 2 );
		var twidth = (width - tileGap) / 2;
		var theight = twidth + (twidth / 7);
		
		var allRowsHtml = '';
		var rows = Math.floor (count / 2 );
		var rem = count % 2;
		
		var vMax = svcCount + 1;
		
		for (r=0; r<rows; r++ ) {
			allRowsHtml += getRowTiles ( r, 2, twidth, theight, tileGap, vMax );
		}
		if ( rem > 0 ) {
			allRowsHtml += getRowTiles ( r, 1, twidth, theight, tileGap, vMax );
		}
		
		var pgStyle = 'margin-left:'+ pgMargin+'px;margin-top:20px;'; 
		
		var html = '<div id="' + myId + '" style="' + pgStyle + '" >'+  allRowsHtml + '</div>';
		return html;
	}
	
	/*
	 * getRowTiles
	 */
	function getRowTiles (row, cols, tw, th, tileGap, vMax )
	{
		var hgap = '<div style="float:left;height:10px;width:'+tileGap+'px" />';		

		var html = '<div style="float:left;margin-bottom:'+tileGap+'px;">';

		for (c=0; c<cols; c++ ) {
			html += getTileHtml(row, c, tw, th, vMax);
			if ( c < cols-1 ) 
				html += hgap;
		}
		html += '</div>';
		return html;
	}
	
	/*
	 * getTileHtml
	 */
	function getTileHtml (r, c, tw, th, vMax )
	{
		var width = tw+'px';
		var height = th+'px';
		var id = 'tl' + r + '-' + c; 
		
		var tileIdx = r*2 + c + 1;
		var visible = tileIdx <= vMax;
		var visStr = visible==true? '': 'display:none;';
		
		var imL = (tw - 30) / 2;
		var imT = (th/2) - 30;
		var txL = (tw - 90) / 2;
		
		var content = '<img src="app/res/img/circle-pls.png" style="width:30px;margin-left:'+imL+'px;margin-top:'+imT+'px" />'+
			'<p style="color:#b3b3b3;margin-left:'+txL+'px;margin-top:10px">Add Business</p>';
		
		var html = 
		'<div class="svc-tile" id="' + id + '" style="background-color:#f9f9f9;float:left;width:'+ width + ';height:' + height+
			';border-style:dashed;border-width:1px;border-radius:10px;border-color:#d0d0d0;' + visStr + '" >' +
			content + '</div>';
		return html;
	}
	
	/**
	 * Action performed 
	 */
	this.performAction = function ( action )
	{
		if ( action.cmd == 'svcAdded' ) {
			dataManager.setUserService ( action.svcDivId, action.config, addResult );
		}
		
		function addResult ( status, data ) 
		{			
			if ( status == 'OK') {
				serviceComp.setIconUI (action.svcDivId, action.config);
			
				// next service placeholder
				nextService ( action.svcDivId );
			}
			else {
				//TODO: Error dialog
				alert ( "Error found" );
			}
		}
	}
	
	/*
	 * divId: tl0-0
	 */
	function nextService ( lastSvcDiv )
	{
		var i = lastSvcDiv.indexOf ('-');
		var col = Number(lastSvcDiv.substring (i+1));
		var row = Number(lastSvcDiv.substring (2, i));

		col++;
		if ( col > 1 ) {
			col = 0;
			row++;
		}
		var nextId = '#tl' + row + '-' + col;
		$ (nextId).fadeIn ('slow');
	}
	
	/**
	 * Refresh the mapp panel view 
	 */
	this.refreshView = function ()
	{
		var pghtml = showAllSvcs (dataManager.getUserServices().length, 10 );
		$('#'+myDivId).html ( pghtml );
		
		// fire event to map user services to icons
		if ( dataManager.getUserServices().length>0 ) {
			SA.fireEvent ( myId, {cmd:'mapUserSvcs'} );
		}
	}
	
	/**
	 * Called to handle async. events specific for this component
	 */
	this.handleEvent = function ( event )
	{
		// map user-services to icon divs
		if ( event.cmd == 'mapUserSvcs' ) {
			var userServices = dataManager.getUserServices();
			var c, r;
			var i=0;
			var cont=true;
			for (r=0; cont; r++ ) {
				for (c=0; c<2; c++ ) {
					var nextId = 'tl' + r + '-' + c;
					serviceComp.setIconUI (nextId, userServices[i].sconf);
					userServices[i].divId = nextId;
					if ( ++i >= userServices.length) {
						cont = false;
						break;
					}
				}
			}
		}
	}
	
	/**
	 * After component is loaded in page  
	 */
	var lastTime = 0;	
	this.postLoad = function ()
	{	
		// select a service
		$( '.svc-tile' ).hammer().bind("tap", function(event) {
			if ( !accept (event) ) return;
			var id = $(this).attr('id');
			
			var usrSvc = dataManager.getUserServiceByDivId ( id );
			// New user service: no svc, show search to add new one
			if ( !usrSvc ) {				
				var searchComp = SA.lookupComponent ('svcSearch' );
				searchComp.showDialog ( 'Add Provider', id, myInst );
			}
			// Existing user service
			else {
				var svcAtom = {ac:'App.SvcHome', config:{userService:usrSvc} };
				var svcHtml = SA.createUI (myId, svcAtom);
				
				var banner = SA.lookupComponent ( 'banner' );
				var title = App.util.safeHtml (usrSvc.sconf.title);
				banner.showNext ('nextSvc', title, svcHtml, true );
			}
		});
		
		// accept event
		function accept (event ){
			var ret = event.timeStamp > lastTime;
			lastTime = event.timeStamp;
			return ret;
		}
	}
}
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.QRManager = function ()
{
	// Other variables
	var myInst, myId ;	
	var initialized = false;
	var currentDlg;
	
	var mleft = $(window).width()/2 - 65;
	
	/**
	 * Login flow list
	 */
	var flowList = { items: 
		[
		{name:'svc-qr-dlg', lc:'App.Dialog', config:{pageStyle:false}, items:
			 [
			 {name:'svc-qr-form', lc:'App.FormHandler', style:'text-align:center',
				 	config:{title:'', listener:this, fitHeight:true}, items:   
				 [
				 {name:'qrMsg', ac:'App.Message' },
				 {html:'div', style:'height:50px;'},
				 
				 {html:'div', style:'text-align:center;font-size:100%;margin-bottom:5px;color:green', 
					 value:'As a provider scan your customer code below..'},
				 {cmd:'cmdQRScan', ac:'App.Button', label:'Scan Code', style:'margin-left:'+mleft+'px', 
					 config:{theme:'blank',defButton:true}},

				 {html:'div', style:'height:30px;'},

				 {html:'div', style:'text-align:center;font-size:100%;margin-bottom:5px;color:green', 
					 value:'Your information and QR code are shown below..'},
				 {html:'div', name:'qrName', style:'text-align:center;font-size:120%', value:'Your Name'},
				 {html:'div', name:'qrEmail', style:'text-align:center;font-size:110%', value:'youremail@host.com'},

				 {html:'div', style:'height:20px;'},

				 {div:'html', id:'qrCode', 
					 value:'<img style="width:80%;margin-left:20px;" src="app/res/gallery/qr-sample.png"/>' },
				 
				 {html:'div', style:'height:20px;'},

				 {cmd:'cmdQRCancel', ac:'App.Button', label:'Close', style:'margin-left:'+(mleft+10)+'px', 
					 config:{theme:'color'} },
					 
				 {html:'div', style:'text-align:center;font-size:100%;margin-bottom:5px;margin-top:15px;color:brown', 
						 value:'Note: in this release, this form is not functional yet!'},
						 
				 {html:'div', style:'height:5px;'}
				 ]
			 }
			 ]
		}
		]
	};
	
	/**
	 * This method creates the UI based on the lists provided
	 */
	this.createUI = function ( parentList, config )
	{
		myId = this.compId;
		myInst = this;
		
		if ( !initialized ) {
			SA.createUI ( myId, flowList );
			initialized = true;
		}
	}
	
	/**
	 * Show a dialog with name
	 */
	this.showDialog = function ()
	{
		var auth = SA.getUserAuth().respData;
		var obj = {};
		obj.qrName = auth.firstName + ' ' + auth.lastName;
		obj.qrEmail = auth.email;
		showDlg ( 'My QR Code', 'svc-qr-dlg', obj );
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdSSAdd' ) {
		}
		else if ( actionAtom.cmd == 'cmdQRCancel' ) {
			currentDlg.showDialog (false);
		}
	}
	
	/*
	 * internal showDlg helper
	 */
	function showDlg ( title, newDlgName, newForm )
	{
		currentDlgName = newDlgName;
		currentDlg = SA.lookupComponent ( currentDlgName );
		if ( currentDlg ) {
			if ( newForm )
				currentDlg.updateForm ( newForm );
			currentDlg.showDialog (true, title );
		}
	}	

	/**
	 * Called when clicking on action buttons
	 */
	this.performAction = function ( compId, atomObj )
	{
		// update form list with data before showing the dialog
		var formComp = SA.lookupComponent ('svc-qr-form');
		
		// for edit user listId and cardId
		if ( atomObj.cmd == 'edit' ) {

		}
		else { // new 
		
		}
	}

	/**
	 * Called to handle events specific for this component
	 */
	this.handleEvent = function ( event )
	{
		if ( event.cmd == 'showLatest' ) {
			
		}
	}
	
	/**
	 * After component is loaded in page  
	 */
	this.postLoad = function ()
	{	
		$( '.list-group-item' ).hammer().bind("tap", function(event) {
			var id = $(this).attr('id');
			var idx = id.substring (id.indexOf ('-')+1);
			
			// Notify that new service will be added to MappList
			var sconf = curSvcLatestConf[idx];			
			curMappComp.actionPerformed ( {cmd:'svcAdded', config:sconf, svcDivId:curSvcDivId} );
			
			currentDlg.showDialog (false);
		});
		
		$( '#ssCancel' ).hammer().bind("tap", function(event) {
			console.debug ('cancel' );
		});
	}
}
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.Service = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var svcConfig  = undefined;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * 
	 * iconUrl: iconUrl 
	 * iconBG: icon background color
	 * title: service title
	 * titleColor: title color
	 * address: address street address
	 * city: city
	 * state: state
	 * userId: ownerId
	 * 
	 */
	this.createUI = function ( list, config )
	{
		myId = this.compId;
		myInst = this;
		
		svcConfig = list.config;
	}
	
	/**
	 * Create title html from config
	 */
	this.titleHtml = function ( sConf )
	{
		return getTitleHtml ( sConf );
	}
	
	/**
	 * Sets icon html in service icon div
	 */
	this.setIconUI = function ( divId, sConf, numAlerts )
	{
		var iconUrl = empty(sConf.iconUrl)? '' : sConf.iconUrl  ;
		var iconBG = empty(sConf.iconBG)? '#f9f9f9' : sConf.iconBG ;
		var ret = '';
		
		var iconWidth = $('#'+divId).width();
		
		if ( empty(sConf.iconUrl) ) {
			ret = getTitleHtml ( sConf, true );	
		}
		else {
			var tihtml = getIconTitle (sConf, iconBG, iconWidth);
			var mediaUrl = SA.server.getMediaUrl (iconUrl);
			var badgeHtml = '';
			if ( numAlerts && numAlerts>0 ) {
				badgeHtml = '<div style="background-color:rgb(255,128,64);position:absolute;margin-top:-10px;font-size:90%" class="badge">'+
				numAlerts+'</div>';
			}
			ret = '<div style="margin-top:5px;margin-left:1px;">'+ badgeHtml + 
				'<img style="width:99%" src="' + mediaUrl + '" />' + tihtml + '</div>' ;
		}
		// use alg to figure out border based on background
		var bordCol = App.util.colorLuminance (iconBG, -0.08);
		
		$svcId = $('#'+divId);
		$svcId.css ( 'background-color', iconBG );
		$svcId.css ( 'border-style', 'solid' );
		$svcId.css ( 'border-color', bordCol );
		
		$svcId.html ( ret );
	}
	
	/*
	 * getTitleHtml formatted 
	 */
	function getIconTitle ( sConf, bgcol, iconWidth )
	{
		var tit = empty(sConf.title)?  'no title': sConf.title ;
		var tco = empty(sConf.titleColor)? '#404040': sConf.titleColor ;
		var add = empty(sConf.address)? 'no address' : sConf.address ; 
		var city = empty(sConf.city)? 'no city' : sConf.city ; 
		//var bg = empty(sConf.titleBG)? bgcol : sConf.titleBG;
		var bg = bgcol;
		
		var lcol = App.util.colorLuminance (bg, 0.1);
		
		var ret = '<div style="font-size:85%;text-align:center;border-top:1px solid '+lcol+';color:'+
			tco+';margin-bottom:2px;background-color:'+bg+'"><div style="margin-top:8px">'+ 
			tit + '</div></div>';
		return ret;
	}

	/*
	 * getTitleHtml formatted 
	 */
	function getTitleHtml ( sConf, forIcon )
	{
		var tit = empty(sConf.title)?  'no title': App.util.safeHtml (sConf.title );
		//var tco = empty(sConf.titleColor)? '#404040': sConf.titleColor ;
		var tco = 'brown';
		var add = empty(sConf.address)? 'no address' : sConf.address ; 
		var city = empty(sConf.city)? 'no city' : sConf.city ;
		
		if ( forIcon == true ) {
			var r1 = '<div style="padding:10px"><div style="color:'+tco+';font-size:110%;padding-bottom:10px;"><b>'+ 
			tit +'</b></div><div class="list-group-item-text">'+add+', ' + city +'</div></div>';
			return r1;
		}
		var ret = '<div style="color:'+tco+';margin-bottom:2px;"><b>'+ 
			tit +'</b></div><div class="list-group-item-text">'+add+', ' + city +'</div>';
		return ret;
	}
	
	/*
	 * Return true if value is empty
	 */
	function empty (val)
	{
		if ( !val || val.length==0 )
			return true;
		return false;
	}
	
	/**
	 * Gets icon URL
	 */
	this.getConfig = function ()
	{
		return svcConfig;
	}
	
	/**
	 * After compoent is loaded in page  
	 */
	this.postLoad = function ()
	{	
	}
}
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.SvcHome = function ()
{
	// Other variables
	var myInst, myId ;
	var userService, svcComp;
	
    // Application Global Styles
    this.css =  { items:
    	[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.svc', 
				value:'width:96%;margin-top:10px;margin-left:auto;margin-right:auto;font-size:110%;'}			 
			]
		},
		 
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.svc', 
				value:'width:96%;margin-top:10px;margin-left:auto;margin-right:auto;font-size:110%;'}			 
			]
		}    	 
    	]
    };		
    
    
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 */
	this.createUI = function ( list, config )
	{
		myId = this.compId;
		myInst = this;
		
		svcComp = SA.createComponent ( 'service', 'App.Service' );
		
		userService = list.config.userService;
		
		//var compName = 'App.Proto';
		var compName = 'App.Comm';
		
		var svcTabs = { 
				ac:'App.SvcTabs', 
				config:{ userService:userService, svcCompName:compName, listener:myInst } 
		};
		var tabsHtml = SA.createUI ( myId, svcTabs );
		
		var homeHtml = getHomePage ();
		
		// clear notifications number (or Badge number)
		App.util.setUserBadge ( userService.sconf.id, false );
		SA.fireEvent ( 'home', {cmd:'setBadge', serviceId:userService.sconf.id} );
		
		// return UI
		var html = '<div style="background-color:#fbfbfb;">' + tabsHtml + homeHtml + '</div>' ;
		return html;
	}
	
	/*
	 * Create home page html
	 */
	function getHomePage ()
	{
		var cls = SA.localCss (myInst, 'svc');
		
		var titleHt = svcComp.titleHtml (userService.sconf);
				
		var html = '<div class="'+cls+'" id="' + myId + '" >' + 
			'<div style="margin-bottom:10px;">' + titleHt + '</div>' +  
			'<div style="color:#B80000;margin-top:20px;" id="svc-rem" >Remove This Service<div></div>';
		
		return html;
	}
	
	/**
	 * Listener methods called from SvcTabs
	 */
	this.peformAction = function ( action )
	{
		if ( action.cmd == 'showHtml' ) {
			//console.debug ( action.data );
			
			var ht = '<div oid="' + myId + '">' + action.data + '</div>';
			$( '#'+myId ).html ( ht );
		}
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		var dlg = SA.lookupComponent ('del-svc-dlg');
		if ( actionAtom.cmd == 'cmdSvcRm' ) {
			dlg.setWaiting ( true );
			var dmgr = SA.lookupComponent ( 'dataManager' );
			dmgr.delUserService ( dataObj.id, delResult );
			function delResult ( status, data ) 
			{
				if ( status == 'OK' ) {
					dlg.showDialog (false);
					var banner = SA.lookupComponent ( 'banner' );
					banner.showPrev();

					// refresh all the services
					var mComp = SA.lookupComponent ( 'mappsList' );
					mComp.refreshView ();
				}
				else {
					// TODO: need to show error here
					dlg.setWaiting (false);
				}
			}
		}
		else if ( actionAtom.cmd == 'cmdSvcRemCancel' ) {
			dlg.showDialog (false);
		}
	}
	
	/*
	 * Remove service from view 
	 */
	function removeService ( userSvcId )
	{
		var dmgr = SA.lookupComponent ( 'dataManager' );		
		dmgr.delUserService ( userSvcId, delResult );
		
		function delResult ( status, data ) 
		{
			if ( status == 'OK' ) {
				var banner = SA.lookupComponent ( 'banner' );
				banner.showPrev();

				// refresh all the services
				var mComp = SA.lookupComponent ( 'mappsList' );
				mComp.refreshView ();
			}
			else {
				// TODO: need to show error here
				//dlg.setWaiting (false);
			}
		}
	}
	
	/**
	 * After component is loaded in page  
	 */
	var lastTime = 0;	
	this.postLoad = function ()
	{	
		//console.debug ( 'ban post load' );
		$ ( '#svc-rem' ).hammer().bind("tap", function(event) {
			var dh = SA.lookupComponent ( 'dlgHelper' );
			dh.showYNDialog ( 'Remove service "' + userService.sconf.title +'" ?', userService.id, dlgHandler);
			function dlgHandler ( yesNo, id ) 
			{
				if ( yesNo == 'YES' ) {
					removeService ( id );
				}
			}
		});

		// Prev page
		$('#' + myId ).hammer().bind( "swiperight", function( event ) {
			if ( !accept (event) ) return;
			
			// show home page
			var pages = SA.lookupComponent ( 'banner' );
			pages.showPrev ();
		});	
		
		// accept event
		function accept (event ) {
			var ret = event.timeStamp > lastTime;
			lastTime = event.timeStamp;
			return ret;
		}		
	}
}
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.SvcSearch = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var currentDlg = undefined;
	var curSvcDivId, curSvcLatestConf, serviceListener;
	var serviceComp = undefined;	
	var initialized = false;
	var myServices = false;
	
	var mleft = $(window).width()/2 - 60;
	var sheight = ($(window).height() - 150) + 'px';
	var svheight = ($(window).height() - 230) + 'px';	
	
	/**
	 * Login flow list
	 */
	var flowList = { items: 
		[
		{name:'svc-find-dlg', lc:'App.Dialog', config:{pageStyle:false}, items:
			 [
			 {name:'svc-find-form', lc:'App.FormHandler', 
				 	config:{title:'', listener:this, fitHeight:true}, items:   
				 [
				 {name:'ssDivId', ac:'App.Variable'},
				 {html:'div', name:'svc-find-title', style:'text-align:center;font-size:135%;margin-top:30px;margin-bottom:5px;', 
					 value:'Add a New Business' }, 
				 
				 {name:'ssMsg', ac:'App.Message' },
				 {html:'div', style:'height:5px;'},				 
				 
				 {html:'div', id:'ssSearchBlock', items:
					 [
					 /*
					 {name:'ssSearch', ac:'App.TextField', info:'Search for Service or Business', 
						 required:true, pattern:'text' },
				     */
					 {id:'svc-find-desc', html:'div', style:'font-size:90%;margin-bottom:2px;color:gray', 
						 value:' Click on a business below to add:' }, 					  
					 ]},
				 
				 {html:'div', id:'ssCont', style:'overflow-y:scroll;-webkit-overflow-scrolling:touch;height:'+sheight, items:
					 [
					 {html:'div', id:'ssResult' }
					 ]
				 },
				 {html:'div', style:'height:10px;'},

				 {name:'cmdSSCancel', cmd:'cmdSSCancel', ac:'App.Button', label:'Cancel', style:'margin-right:15px;margin-left:'+mleft+'px', 
					 config:{theme:'color'} },
				 {name:'cmdSSAdd', cmd:'cmdSSAdd', ac:'App.Button', label:'Add New', style:'display:none', 
						 config:{theme:'blank'} }
				 ]
			 }
			 ]
		}
		]
	};
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 */
	this.createUI = function ( parentList, config )
	{
		myId = this.compId;
		myInst = this;
		serviceComp = SA.createComponent ( 'service', 'App.Service' );
	}
	
	/**
	 * Search for existing services
	 */
	this.showDialog = function ( newTitle, ssDivId, mappComp )
	{
		if ( !initialized ) {
			SA.createUI ( myId, flowList );
			initialized = true;
		}
		curSvcDivId = ssDivId;
		serviceListener = mappComp;
		myServices = false;
		showDlg ( newTitle, 'svc-find-dlg', 
				{ssDivId:ssDivId, 'svc-find-title':'Add a New Business'} );
		SA.fireEvent ( myId, {cmd:'showLatest'} );
	}
	
	/**
	 * Dialog to pick services owned by logged in user
	 */
	this.showForSignedIn = function ( newTitle, listenerComp )
	{
		if ( !initialized ) {
			SA.createUI ( myId, flowList );
			initialized = true;
		}
		curSvcDivId = '';
		serviceListener = listenerComp;
		myServices = true;
		showDlg ( newTitle, 'svc-find-dlg', {ssDivId:'', 'svc-find-title':newTitle} );
		
		// show add service
		$('#cmdSSAdd').show ();
		$('#ssSearch').hide();
		$('#cmdSSCancel').css ( 'margin-left', mleft-50+'px' );
		$('#ssCont').css ( 'height', svheight );
		
		var msg = '<p style="font-size:120%;font-weight:bold">Feel free to add a business service icon and tell your users about it. ' +
			'This service is currently complimentary!</p>' +		
			'<br>Services created by me:';
		$('#svc-find-desc').html ( msg );
		
		// show services for logged in user
		SA.fireEvent ( myId, {cmd:'showLatest', userId:'signed-in' } );
	}

	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdSSAdd' ) {
			// close my search dialog
			currentDlg.showDialog (false);

			// call to create a new service
			serviceListener.performAction ( {cmd:'svcNew'} );
		}
		else if ( actionAtom.cmd == 'cmdSSCancel' ) {
			currentDlg.showDialog (false);
		}
	}
	
	/*
	 * internal showDlg helper
	 */
	function showDlg ( title, newDlgName, newForm )
	{
		currentDlgName = newDlgName;
		currentDlg = SA.lookupComponent ( currentDlgName );
		if ( currentDlg ) {
			if ( newForm )
				currentDlg.updateForm ( newForm );
			currentDlg.showDialog (true, title );
		}
	}	

	/**
	 * Called to handle events specific for this component
	 */
	this.handleEvent = function ( event )
	{
		if ( event.cmd == 'showLatest' ) {
			$('#ssResult').html ( 'Loading please wait..' );
			
			// load data
			var dm = SA.lookupComponent ('dataManager');
			var svcConfList ;
			// Provider: get my services
			if ( event.userId ) {
				svcConfList = dm.getMyServices ( {userId:event.userId}, handleData );
			}
			// Consumer: get all services
			else {
				svcConfList = dm.getServices ( {}, handleData, false );
			}
			
			/*
			 * Data handler call back from dataManager comp
			 */
			function handleData ( status, data )
			{
				var ret = 'No services found';
				
				if ( status == 'OK' ) {
					if ( data && data.length > 0 ) {
						ret = '<div id="' + myId + '" class="list-group">'
						for ( i=0; i<data.length; i++ ) {
							var item = serviceComp.titleHtml ( data[i] );
							ret += '<a id="svs-' + i + 
								'" href="#" class="list-group-item"><div class="list-group-item-text">' + 
								item + '</div></a>';
						}
						curSvcLatestConf = data;
						ret += '</div>';
					}
				}
				$('#ssResult').html ( ret );
			}
		}
	}
	
	/**
	 * After compoent is loaded in page  
	 */
	this.postLoad = function ()
	{	
		$( '.list-group-item' ).hammer().bind("tap", function(event) {
			var id = $(this).attr('id');
			var idx = id.substring (id.indexOf ('-')+1);
			
			// Notify that new service will be added to MappList
			var sconf = curSvcLatestConf[idx];

			currentDlg.showDialog (false);

			if ( myServices == true ) {
				serviceListener.performAction ( {cmd:'svcEdit', config:sconf} );
			}
			else {
				// notify the listener component that the server needs to be added to the UI
				serviceListener.performAction ( {cmd:'svcAdded', config:sconf, svcDivId:curSvcDivId} );
			}
		});
		
		$( '#ssCancel' ).hammer().bind("tap", function(event) {
			console.debug ('cancel' );
		});
	}
}
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.SvcTabs = function ()
{
	// Other variables
	var myInst, myId ;
	var svcComp, userService, tabcls;
	var tabPrefId = 'tab-';
	var maxTabs, listener;
	var firstTime = true;
	
    // Application Global Styles
    this.css =  { items:
    	[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.cls', value:'width:100%;height:40px;background-color:#f6f6f6'},
			{name:'.tab', value:'float:left;color:#101010;font-size:90%;margin:10px;border-right:solid white' }			
			]
		},
		 
		/* Mobile larger */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.cls', value:'width:100%;height:30px;background-color:#f6f6f6'},
			{name:'.tab', 
				value:'float:left;color:#101010;font-size:95%;padding:8px;border-right:solid white;border-width:1px;' }			
			]
		},
		
		/* Mobile smaller */
		{name: '@media (max-width: 326px)', items: 
			[
			{name:'.cls', value:'width:100%;height:30px;background-color:#f6f6f6'},
			{name:'.tab', 
				value:'float:left;color:#101010;font-size:85%;padding:7px;border-right:solid white;border-width:1px;' }			
			]
		}    	 		
    	]
    };
    
    var tabsText ;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * 
	 * svcCompName; service component obj name
	 * userService: userService object
	 * listener: tabs listener (implement performAction)
	 */
	this.createUI = function ( list, config )
	{
		myInst = this;
		myId = this.compId;
		
		// get listener to tabs
		listener = SA.getConfig (list, 'listener' );
	
		// get passed svc component name
		var compName = SA.getConfig (list, 'svcCompName' );
		
		// get passed user service
		userService = SA.getConfig (list, 'userService' );
		
		tabPrefId += myId + '-';
		
		// create component instance as Singleton (always same name)
		svcComp = SA.createComponent ( compName, compName );
		svcComp.createUI ();
		
		// tab bar component		
		tabsText = svcComp.getProtoTabs ( userService.sconf );
		maxTabs = tabsText.length;
		
		tabcls = SA.localCss (myInst, 'tab');
		
		var cls = SA.localCss (myInst, 'cls');
		
		var tabsHtml = getTabsHtml (maxTabs);
		
		var html = '';
		if ( maxTabs > 0 ) {
			html = '<div class="'+cls+'" id="' + myId + '" >' + tabsHtml + '</div>';
		}
		else {
			html = '<div id="' + myId + '" >' + tabsHtml + '</div>';			
		}
		return html;
	}
	
	/*
	 * Gets tabs html
	 */
	function getTabsHtml (count)
	{
		// set max tabs
		maxTabs = count;
		var html = '<div>';
		for ( i=0; i<count; i++ ) {
			var ttext = tabsText [i];
			
			var id = tabPrefId + i;
			html += '<div id="'+id+'" class="' +tabcls+ '" >' + ttext + '</div>';
		}
		html += '</div>';
		return html;
	}
	
	/*
	 * Select a tab
	 */
	function selectTab ( id )
	{
		var html = '';
		if ( maxTabs > 0 ) {
			var tidx = Number(id);
			for (i=0; i<maxTabs; i++ ) {
				var $div = $('#'+tabPrefId+i);
				if ( i == tidx ) {
					$div.css ('background-color', 'white' );
					$div.css ('height', '30px' );
					$div.css ('font-weight', 'bold');
				}
				else {
					$div.css ('background-color', '#f6f6f6' );
					$div.css ('height', '30px' );
					$div.css ('font-weight', 'normal');				
				}
			}
			html = svcComp.getProtoTabHtml ( userService.sconf, tidx );
		}
		else {
			html = svcComp.getProtoTabHtml ( userService.sconf, 0 );
		}
		//console.debug ( html );
		listener.peformAction ( {cmd:'showHtml', data:html} );
	}
	
	/**
	 * After component is loaded in page  
	 */
	this.postLoad = function ()
	{
		// select tab 0 (only once)
		if ( firstTime ) {
			selectTab (0);
			firstTime = false;
		}
		
		$ ( '.'+tabcls ).hammer().bind("tap", function(event) {
			var id = $(this).attr('id');			
			selectTab ( id.substring(tabPrefId.length) );
		});
	}
}
;/**
 * Component works with prototyping UI based on resource tabs and tab contents
 */
App.Comm = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var svcConfig;
	var feedId;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * 
	 */
	this.createUI = function ( list, config )
	{
		myId = this.compId;
		myInst = this;
		
		feedId = 'feed-' + myId;
	}
	
	/**
	 * Return prototype tab names in array
	 *  
	 * NOTE: it looks for resource str name: STR:<svcTitle>:tabs
	 */
	this.getProtoTabs = function ( sconf )
	{
		svcConfig = sconf;
		return [ 'Latest News', 'About Us' ];
		//return [];
	}
	
	/**
	 * Returns html for all UI for specific service 
	 * 
	 * NOTE: it looks for resource str name: STR:<svcTitle>:tab<idx>
	 */
	this.getProtoTabHtml = function ( sconf, tabIdx )
	{
		svcConfig = sconf;

		var html ;
		if ( tabIdx == 0 ) {
			App.util.startWorking ();
			html = getNewsPanel (sconf.id, svcConfig.groupId);
			
			// load feeds
			SA.fireEvent ( myId, {cmd:'loadFeeds', serviceId:sconf.id} );
		}
		else if ( tabIdx == 1 ) {
			html = getDefAbout (sconf);
		}
		var ret = '<div id="' + myId + '" >' + html + '</div>';
		return ret;
	}
	
	/**
	 * performAction called by button
	 */
	this.performAction = function ( compId, myAtomObj, myComp )
	{
		// create new post
		if ( myAtomObj.cmd == 'cmdPostBt' ) {

			var html = createPostUI ();
			var banHt = getPostBanner ( false );
			var ban = SA.lookupComponent ( 'banner' );
			ban.showNext ( 'postUI', banHt, html, false);
		}
	}
	
	/**
	 * Handle async. event
	 */
	this.handleEvent = function ( event )
	{
		// reload all feeds
		if ( event.cmd == 'loadFeeds' ) {
			getLatestFeed ( event.serviceId );
		}
		// edit an existing post
		else if ( event.cmd == 'editPost' ) {
			//console.log ( 'edit post: data=' + event.data );
			var html = createPostUI ( event.data  );
			var banHt = getPostBanner ( true );
			var ban = SA.lookupComponent ( 'banner' );
			ban.showNext ( 'postUI', banHt, html, false);
		}
		else if ( event.cmd == 'delPost' ) {
			var dm = SA.lookupComponent ( 'dataManager' );
			dm.delPosting ( event.sid, event.pid, handler );
			function handler (status, data )
			{
				if ( status == 'OK' ) {
					// reload async. 
					SA.fireEvent ( myId, { cmd:'loadFeeds', serviceId:event.sid});					
				}
			}
		}
	}
	
	/*
	 * Create create / edit posting UI
	 */
	function createPostUI ( postData )
	{
		var pui = {name:'postUI', ac:'App.PostUI', config:{sconf:svcConfig, pdata:postData} };
		var puiHt = SA.createUI ( myId, pui );
		
		//var style = 'position:fixed;overflow-y:scroll;-webkit-overflow-scrolling:touch;width:100%;height:100%;';
		var style = 'width:100%;height:100%;';
		
		var html = '<div style="' + style + '" id="' + myId + '">' + puiHt + '</div>' ;
		return html;
	}
	
	/*
	 * Get post banner
	 */
	function getPostBanner ( isEdit )
	{
		var comp = SA.lookupComponent ('postUI' );
		return comp.getBanner ( isEdit );
	}
	
	/**
	 * Get post button UI
	 */
	function getNewsPanel ( serviceId )
	{
		var html = '<div>';
		
		if ( App.util.canAdminSvc (serviceId, svcConfig.groupId) ) { 
			var pbut = {name:'postBt', cmd:'cmdPostBt', ac:'App.Button', label:'New Post', 
					style:'font-size:85%;margin-top:5px;margin-bottom:5px;border-color:#f0f0f0', 
					config:{theme:'blank',defButton:true, listener:myInst}};
			var postHt =  SA.createUI ( myId, pbut );
			html += '<div>' + postHt + '</div>';
		}
		
		html += '<div id="' + feedId + '" />';		
		return html + '</div>';
	}
	
	/**
	 * Gets news feed from cache or server
	 */
	function getLatestFeed ( serviceId )
	{
		var dmgr = SA.lookupComponent ( 'dataManager');
		dmgr.getLatestFeed ( serviceId, dataHandler );
		function dataHandler ( status, data ) 
		{
			if ( status == 'OK' ) {
				//console.debug ( data );
				var html = getFeedHtml ( dmgr, data, true );
				$( '#' + feedId ).html ( html );
				
				// stop loading after one sec
				setTimeout(function () {
					App.util.stopWorking ();
				}, 400);
			}
			else {
				console.log ( 'ERROR: ' + data );
				App.util.stopWorking ();
				// TODO: handle error
				//return getFeedHtml ( data, false );
			}
		}
	}
	
	/*
	 * Return the feed html view
	 */
	function getFeedHtml ( dmgr, dataArray, suceess ) 
	{
		var viewComp = SA.createComponent ( 'postView', 'App.PostView' );
		
		if ( dataArray.length == 0 ) {
			return  '<div style="height:600px" />';
		}
		var ret = '<div>';
		
		for ( i=0; i<dataArray.length; i++ ) {
			pdata = dataArray[i] ;
			var ht = viewComp.createUI ( {config:{data:pdata, 
						showPoster:svcConfig.showPoster, 
						showComm:svcConfig.showComm, 
						groupId:svcConfig.groupId} } );
			ret += ht;
		}
		return ret + '</div>';
	}
	
	/**
	 * Gets default (stub) service content 
	 */
	function getDefAbout (sconf)
	{
		var svcComp = SA.createComponent ( 'service', 'App.Service' );		
		
		var pic = '';

		if ( sconf.title=='CYCLE SPORTS' ) {
			pic = '<img style="width:100%" src="app/res/gallery/cs.jpg" />';
		}
		else if ( sconf.title=='Philz Coffee' ) { 
			pic = '<img style="width:100%" src="app/res/gallery/pc.jpg" />';			
		}
		else if ( sconf.title=='Encinal Hardware' ) { 
			pic = '<img style="width:100%" src="app/res/gallery/eh.jpg" />';			
		}
		else if ( sconf.title=='Alameda Theatre'  ) {
			pic = '<img style="width:100%" src="app/res/gallery/at.jpg" />';						
		}
		else if ( sconf.title=='OAKLAND ZOO' ) {
			pic = '<img style="width:100%" src="app/res/gallery/ozoo.jpg" />';									
		}
		else if ( sconf.title=='Cinema Grill' ) {
			pic = '<img style="width:100%" src="app/res/gallery/cg.jpg" />';
		}
		else {
			var mediaUrl = SA.server.getMediaUrl (sconf.iconUrl);
			pic = '<img class="img-responsive" src="' + mediaUrl + '" />';
		}
		
		var titleHt = svcComp.titleHtml (sconf);
				
		var html = '<div>' + 
			'<div style="margin-bottom:10px;">' + titleHt + '</div>' +  
			'<div>' + pic + '</div>' +  
			'<div style="color:#B80000;margin-top:20px;" id="svc-rem" >Remove This Service<div></div>';
		
		return html;
	}	
}
;/**
 * Component works with prototyping UI based on resource tabs and tab contents
 */
App.PostUI = function ()
{
	// local variables
	var myInst, myId ;
	var numberOfPhotos = 0;
	var svcConfig ;
	var postData;
	
	// post data
	var postMsg = '';
	var imgFileList = [];
	var imgMsgList = [];
	
	/**
	 * Service flow list 
	 */
	var postForm = {name:'service-post-form', lc:'App.FormHandler', style:'margin:5px',
		config:{title:'', listener:this, pageStyle:true}, items: 
		[
		{name:'postErr', ac:'App.Message', style:'margin:3px' },

		{name:'postMsg', ac:'App.TextArea', info:'Write something', 
			config: {style:'border-color:#f5f5f5;font-size:100%;', rows:6} },

		{html:'div', id:'formatHelp', value:' Formatting help?', style:'font-size:80%;margin-bottom:10px;' },
			
		{name:'postPic-0', ac:'App.UploadSmpl', 
			config:{btText:'Add photo', listener:this, addCap:true} },
		
		// extra div to grow form dynamically 
		{html:'div', id:'postExtra' }
		]
	};
		
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * 
	 */
	this.createUI = function ( list, config )
	{
		myId = this.compId;
		myInst = this;
		
		// svc config
		svcConfig = list.config.sconf;
		
		// First: set passed postData (ONLY for edit mode)
		postData = list.config.pdata;
		
		var taHt = getPostText (postData);

		// no banner
		//var chtml = getBanHt(postData) + taHt;
		
		var ret = '<div id="' + myId + '">' + taHt + '</div>';
		
		// Second: if postData passed, populate for edit 
		if ( postData ) {
			SA.fireEvent ( myId, {cmd:'loadForEdit', pdata:postData} );
		}
		return ret;
	}
	
	/**
	 * performAction called by button
	 */
	this.performAction = function ( compId, obj, myComp )
	{
		if ( obj.cmd == 'attPhoto' ) {
			//alert ('add photos');
			
			window.imagePicker.getPictures(
				function(results) {
					for (var i = 0; i < results.length; i++) {
						//console.log('Image URI: ' + results[i]);
						alert ( 'url: ' + results[i] );
					}
				}, 
				function (error) {
					alert ( 'error: ' + error);
					//console.log('Error: ' + error);
				},
				{
					maximumImagesCount: 10,
					width: 200
				}
			);
		}
		else if ( obj.cmd == 'imgAdded' ) {
			numberOfPhotos++;
			var npbut = {name:'postPic-' + numberOfPhotos, ac:'App.UploadSmpl', 
					style:'float:left;width:100px;font-size:90%;',
					config:{btText:'+ Add more', listener:this, addCap:true, imgUrl:obj.imgUrl, imgCap:obj.imgCap} };
			var nbHt = SA.createUI (myId, npbut);
			$('#postExtra').append (nbHt);
			
			// prog. add comp to form
			var form = SA.lookupComponent ( 'service-post-form' );
			form.addComponent (npbut.name, npbut.ac);
			
			// scroll to end of page
			//scrollToEnd ();
		}
	}
	
	this.getBanner = function ( isEdit )
	{
		var bstyle = 'background-color:#999999;margin:0px;height:65px;';
		
		var postLabel = ' Post ';
		if ( isEdit == true ) {
			postLabel = ' Re-Post ';
		}

		var bcont = 
			'<div style="text-align:center;padding-top:22px;font-size:120%;color:silver;margin-bottom:-15px;"><b>Post Message</b></div>' +
			'<div><div style="float:left;font-size:110%;color:white;padding:5px;" id="postCan"> Cancel </div>' + 
			'<div style="float:right;font-weight:bold;font-size:115%;color:white;padding:5px;" id="postDo">' + postLabel + '</div></div>';
		
		var bcomp = SA.lookupComponent ('banner');
		var banHt = bcomp.getCustom ( bcont, bstyle );
		
		return banHt;
	}
	
	function getPostText ( pdata )
	{
		if ( pdata ) {
			postForm.items[1].value = pdata.msg;
		}
		else {
			postForm.items[1].value = '';			
		}
		var html = SA.createUI ( myId, postForm );
		return html;
	}
	
	/**
	 * Scroll to end of page
	 */
	function scrollToEnd ()
	{
		$( '#' + myId ).css ( 'top', '600px' );
	}
	
	/*
	 * showMessage
	 */
	function showMessage (name, msg, success )
	{
		var msgComp = SA.lookupComponent ( name );
		msgComp.showMessage ( msg, success );
	}
	
	/**
	 * Handle form post
	 */
	function handleFormPost ()
	{
		var pform = new FormData();
		
		var form = SA.lookupComponent ( 'service-post-form' );
		var fcomps = form.getFormComps ();
		
		var mediaIdList = [];
		var msgList = [];
		
		for ( i=0; i<fcomps.length; i++ ) {
			var c = fcomps[i];
			if ( c.getName && c.getValue ) {
				var name = c.getName();
				if ( name == 'postMsg') {
					var mval = c.getValue();
					if ( !mval || mval.trim().length==0 ) {
						showMessage ( 'postErr', 'Post message cannot be blank', false);
						return;
					}
					mval = App.util.safeHtml ( mval );
					pform.append ('msg', mval );
				}
				else if ( name.indexOf ('postPic') >=0 ) {
					// if there is a file accept the File object
					if (  c.getValue() ) {
						mediaIdList.push ( c.getValue() );
						var cap = '';
						if ( c.getCaption() ) {
							cap = c.getCaption();
							cap = App.util.safeHtml (cap);
						}
						msgList.push ( cap );
					}
				}
			}	
		}
		pform.append ( 'serviceId', svcConfig.id );
		pform.append ( 'serviceTitle', svcConfig.title );
		
		// add all files and msgs to form (array is created on server because of '-' )
		for (i=0; i<mediaIdList.length; i++ ) {
			pform.append ( 'mediaId-' + i, mediaIdList[i] );
			pform.append ( 'msg-' + i, msgList[i] );
		}
		
		if ( postData ) {
			pform.append ( 'id', postData.id );
		}
		
		// post thru the data manager
		var dmgr = SA.lookupComponent ( 'dataManager' );
		dmgr.savePosting ( pform, dataHandler, postData != undefined  );
		// clear cache
		dmgr.clearFeedsCache ( svcConfig.id );
		
		App.util.startWorking ();
		
		function dataHandler ( status, data ) 
		{
			if ( status=='OK' ) {
				SA.fireEvent ( 'App.Comm', {cmd:'loadFeeds', serviceId:svcConfig.id} );
				showMessage ( 'postErr', 'Post Successful', true);
				App.util.stopWorking ();
				$( '#postCan' ).trigger('tap');
			}
			else {
				showMessage ( 'postErr', 'Service errors encountered! Please try again later.', false);
				App.util.stopWorking ();
			}
		}
	}
	
	/**
	 * Handle events fired by SA.fireEvent (e) calls 
	 */
	this.handleEvent = function ( event )
	{
		// Edit mode: load data
		if ( event.cmd == 'loadForEdit' ) {
			var data = event.pdata;
			if ( !data.mediaIdList )
				return;
			var i;
			for ( i=0; i<data.mediaIdList.length; i++ ) {
				var imgUrl = data.mediaIdList [ i ];
				var imgCap = '';
				if (data.msgList && data.msgList[i]) {
					imgCap = data.msgList[i];
				}
				myInst.performAction ( myId, 
						{cmd:'imgAdded', imgUrl:imgUrl, imgCap:imgCap}, 
						myInst );
			} 
			
			// remove the first add button (when editing)
			var form = SA.lookupComponent ( 'service-post-form' );
			form.removeComponent ( 'postPic-0' );
		}
	}
	
	/**
	 * After compoent is loaded in page  
	 */
	this.postLoad = function ()
	{	
		$( '#postCan').hammer().bind("tap", function(event) {
			var ban = SA.lookupComponent ( 'banner' );
			ban.showPrev ();
		});
		
		$( '#postDo' ).hammer().bind("tap", function(event) {
			handleFormPost ();
		});
		
		$( '#formatHelp').hammer().bind("tap", function(event) {
			var dh = SA.lookupComponent ('dlgHelper');
			var msg = 
			'<div style="font-size:110%"><p><b>You can use the following tags to format your message:</b></p><code>'+
				'{h} Header Name {h}<br>' +
				'{f} Fixed font text {f}<br>' +
				'{p} Regular paragraph {p}<br>' + 
				'{l} Link label, http://link-url {l}<br><br>' + 
				'Or you can just type plain text.<br><br>' +
			'</code></div>';
			
			dh.showOKDialog ( msg );
		});
	}
}
;/**
 * Component works with prototyping UI based on resource tabs and tab contents
 */
App.PostView = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	
	var cardCss, titleCss, paragCss;
	var editCls, delCss;
	
	// some config
	var showPoster, showComments, groupId;
	
	this.css = { items: 
		[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[ 
			{name:'.card', value:'margin-bottom:40px; border: 1px solid #f0f0f0;border-radius:5px;padding:10px;background-color:#fff;' },			 
			{name:'.title', value:'font-size:160%;margin-top:4px;margin-bottom:4px;'},
			{name:'.parag', value:'font-size:90%;margin-top:4px;margin-bottom:6px;'}
			]
		},
		  
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.card', value:'margin-bottom:18px; border: 1px solid #f0f0f0;border-radius:5px;padding:5px;background-color:#fff;' },			 
			{name:'.title', value:'font-size:130%;margin-bottom:2px;'},
			{name:'.parag', value:'font-size:90%;margin-top:4px;margin-bottom:4px;'}			
			]
		},
		{name: '.editCls', value: 'color:#d0d0d0;float:right' },
		{name: '.delCls', value: 'color:#d0d0d0;float:right' },
		]
	};
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * 
	 */
	this.createUI = function ( atom, config )
	{
		myId = this.compId;
		myInst = this;
		
		cardCss = SA.localCss ( this, 'card');
		titleCss = SA.localCss ( this, 'title');
		paragCss = SA.localCss ( this, 'parag' );
		editCls = SA.localCss (this, 'editCls' );
		delCls = SA.localCss (this, 'delCls' );

		// some config
		showPoster = SA.getConfig (atom, 'showPoster', true);
		showComments = SA.getConfig (atom, 'showComm', true);
		groupId = SA.getConfig (atom, 'groupId' );
		
		var postData = atom.config.data;
		
		return createHtml ( postData );
	}
	
	/*
	 * Create ui from post data
	 */
	function createHtml ( pdata ) 
	{
		var html = 
			'<div id="' + myId + '" class="' + cardCss + '" >' ;
		
		if ( showPoster == true ) {
			html += getPoster (pdata);
		}
		html += '<div class="' + paragCss + '">' + formatMsg(pdata.msg) + '</div>' + getPhotos (pdata) ;

		// show comments, likes, admin menu bar
		html += getLikesBar (pdata, showComments) ;

		return html + '</div>';
	}
	
	function getLikesBar ( pdata, showComments ) 
	{
		var numComm = 0;
		var numLikes = 0;
		
		var editId = 'ped-' + pdata.serviceId + '-' + pdata.id;
		var delId =  'pdl-' + pdata.serviceId + '-' + pdata.id;
		
		var html = '<div style="margin-top:5px;padding:5px;font-size:80%;font-weight:bold;height:30px;width:100%;color:#407fbf">';
			
		if ( showComments == true ) {
			html += '<div style="float:left">' + numComm + ' Comments&nbsp;&nbsp;&nbsp;&nbsp' + numLikes + ' Likes </div>' ;
		}
		
		// If can admin allow to edit
		if ( App.util.canAdminSvc ( pdata.serviceId, groupId ) ) { 
			html += '<div><div class="' + delCls + '" id="' + delId + '">  |&nbsp; Del  )</div><div class="' + 
				editCls + '" id="' + editId + '">(  Edit&nbsp;&nbsp;</div></div>';
		}
		
		return html + '</div>';
	}
	
	function getPoster ( pdata )
	{
		var html = '<div><img style="float:left;width:30px;margin-right:10px;" src="app/res/img/unknown.png" />';
		
		html += '<div style=""><div style="font-size:90%;font-weight:bold">' + pdata.userComName + '</div>';
		
		var time = App.util.getFriendlyTime (pdata.modifiedMs);
		html += '<div style="font-size:70%;margin-bottom:10px">' + time + '</div></div>';
		
		return html + '</div>';
	}
	
	function getPhotos ( pdata )
	{
		var ret = '';
		var i=0;
		if ( pdata.mediaIdList && pdata.mediaIdList.length>0 ) {
			for (i=0; i<pdata.mediaIdList.length; i++ ) {
				var url = SA.server.getMediaUrl (pdata.mediaIdList[i]);
				ret += '<div><img style="width:100%" src="'+url+'" /></div>';
				
				if ( pdata.msgList && i<pdata.msgList.length ) {
					ret += '<div style="font-size:85%;margin:8px;">' + 
						formatMsg(pdata.msgList[i]) + '</div>';
				}
			}
		}
		return ret;
	}
	
	/**
	 * Post load handling 
	 */
	var lastTime = 0;
	this.postLoad = function ()
	{
		// tap on edit class of any edit link
		$ ( '.'+editCls ).hammer().bind("tap", function(event) {
			if ( accept (event) ) {
				var id = $(this).attr('id');
				var idObj = extractIds ( id );
				var dm = SA.lookupComponent ( 'dataManager' );
				var post = dm.getPostingById ( idObj.sid, idObj.pid );
				
				//console.debug (post );
				SA.fireEvent ( 'App.Comm', {cmd:'editPost', data:post} );
			}
		});
		
		// tap on del
		$ ( '.'+delCls ).hammer().bind("tap", function(event) {
			if ( accept (event) ) {
				var id = $(this).attr('id');
				var idObj = extractIds ( id );
				var dh = SA.lookupComponent ( 'dlgHelper' );
				dh.showYNDialog ( 'Delete this post message?', idObj.pid, dlgHandler);
				function dlgHandler ( status, id ) {
					if ( status == 'YES' ) {
						SA.fireEvent ( 'App.Comm', {cmd:'delPost', sid:idObj.sid, pid:idObj.pid} );
					}
				}
			}
		});
		
		function extractIds ( divId ) 
		{
			var idx = divId.indexOf ('-',4);
			var sid = Number(divId.substring ( 4, idx ));
			var pid = Number(divId.substring (idx+1));
			return {sid:sid, pid:pid};
		}
		
		// accept event
		function accept (event )
		{
			var ret = event.timeStamp > lastTime;
			lastTime = event.timeStamp;
			return ret;
		}	
	}
			
	
	
	
	/*
	 * Message formatter logic (convert special codes to html)
	 * 
	 * {h}Header Message{h}
	 * {code}fixed format text{code}
	 * {link}linkname,url{link}
	 * {p}some paragraph{p}
	 */
	function formatMsg ( msg )
	{
		//console.debug ( msg );
		var tag = {endIdx:-1};
		var html = '';
		var lastIdx = 0;
		
		while ( true && tag ) 
		{
			tag = getNextTag ( tag, tag.endIdx+1, msg );
			// no more tags get after 'lastIdx'
			if ( !tag ) {
				html += msg.substring (lastIdx);
				break;
			}
			
			// copy extra text if any 
			if ( lastIdx > 0 )
				html += msg.substring ( lastIdx, tag.startIdx );
			
			if ( tag.val == 'h' ) {
				html += '<p><b>';
				lastIdx = tag.endIdx+1;
				tag = getNextTag ( tag, lastIdx, msg );
				if ( tag && tag.val == 'h' ) {
					html += msg.substring (lastIdx, tag.endIdx-2);
					html += '</b></p>';
					lastIdx = tag.endIdx+1;
				}
			}
			else if ( tag.val == 'f' ) {
				html += '<pre>';
				lastIdx = tag.endIdx+1;
				tag = getNextTag ( tag, lastIdx, msg );
				if ( tag && tag.val == 'f' ) {
					html += msg.substring (lastIdx, tag.endIdx-2);
					html += '</pre>';
					lastIdx = tag.endIdx+1;
				}
			}
			else if ( tag.val == 'l' ) {
				html += '<a ';
				lastIdx = tag.endIdx+1;
				tag = getNextTag ( tag, lastIdx, msg );
				if ( tag && tag.val == 'l' ) {
					html += getLinkHtml(msg.substring (lastIdx, tag.endIdx-2));
					html += '</a><br>';
					lastIdx = tag.endIdx+1;
				}
			}
			else if ( tag.val == 'p' ) {
				html += '<p>';
				lastIdx = tag.endIdx+1;
				tag = getNextTag ( tag, lastIdx, msg );
				if ( tag && tag.val == 'p' ) {
					html += msg.substring (lastIdx, tag.endIdx-2);
					html += '</p>';
					lastIdx = tag.endIdx+1;
				}
			}
		}		
		return html;
	}
	
	/*
	 * Gets the link value between the <a> tags
	 */
	function getLinkHtml ( linkVal )
	{
		var html = '';
		var items = linkVal.split (',');
		var link, label;
		
		for ( var i=0; i<items.length; i++ ) {
			var item = items[i].trim();
			if ( item.indexOf ('http') ==0 ) 
				link = item;
			else 
				label = item;
		}
		if ( link ) {
			html += 'href="' + link +'" target="_blank">';
			if ( label ) 
				html += label;
			else 
				html += link;
		}
		else {
			html = 'BAD link format! {link}label,url{link}';
		}
		return html;
	}	
	
	/*
	 * Parse next tag from tags formatted message
	 */
	function getNextTag ( tag, idx, msg )
	{
		var i0 = msg.indexOf ( '{', idx );
		if ( i0 >= 0 ) {
			var i1 = msg.indexOf ( '}', i0+1 );
			if ( i1 > 0 ) {
				tag.val = msg.substring ( i0+1, i1 ).toLowerCase();
				tag.startIdx = i0;
				tag.endIdx = i1;
				return tag;
			}
		}
	}
	
}
;/**
 * Component works with prototyping UI based on resource tabs and tab contents
 */
App.Proto = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var svcConfig;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * 
	 */
	this.createUI = function ( list, config )
	{
		myId = this.compId;
		myInst = this;
	}
	
	/**
	 * Return prototype tab names in array
	 *  
	 * NOTE: it looks for resource str name: STR:<svcTitle>:tabs
	 */
	this.getProtoTabs = function ( sconf )
	{
		var title = sconf.title.toLowerCase().replace (' ', '-');
		var tabs = SA.res.getValue ( 'STR:' + title + '.tabs' );
		if ( tabs && tabs.length> 0 ) {			
			var tabsArr = tabs.split (',');
			return tabsArr;
		}
		else {
			return [];
		}
	}
	
	/**
	 * Returns prototype tab index html
	 * 
	 * NOTE: it looks for resource str name: STR:<svcTitle>:tab<idx>
	 */
	this.getProtoTabHtml = function ( sconf, tabIdx )
	{
		var title = sconf.title.toLowerCase().replace (' ', '-');
		var thtml = SA.res.getValue ( 'STR:' + title + '.tab' + tabIdx );
		if ( thtml && thtml.length>0 )
			return thtml;
		else 
			return getDefHome ( sconf);
	}
	
	/**
	 * Gets default (stub) service content 
	 */
	function getDefHome (sconf)
	{
		var svcComp = SA.createComponent ( 'service', 'App.Service' );		
		
		var pic = '';

		if ( sconf.title=='CYCLE SPORTS' ) {
			pic = '<img style="width:100%" src="app/res/gallery/cs.jpg" />';
		}
		else if ( sconf.title=='Philz Coffee' ) { 
			pic = '<img style="width:100%" src="app/res/gallery/pc.jpg" />';			
		}
		else if ( sconf.title=='Encinal Hardware' ) { 
			pic = '<img style="width:100%" src="app/res/gallery/eh.jpg" />';			
		}
		else if ( sconf.title=='Alameda Theatre'  ) {
			pic = '<img style="width:100%" src="app/res/gallery/at.jpg" />';						
		}
		else if ( sconf.title=='OAKLAND ZOO' ) {
			pic = '<img style="width:100%" src="app/res/gallery/ozoo.jpg" />';									
		}
		else if ( sconf.title=='Cinema Grill' ) {
			pic = '<img style="width:100%" src="app/res/gallery/cg.jpg" />';
		}
		else {
			var mediaUrl = SA.server.getMediaUrl (sconf.iconUrl);
			pic = '<img style="width:60%" src="' + mediaUrl + '" />';
		}
		
		var titleHt = svcComp.titleHtml (sconf);
				
		var html = '<div>' + 
			'<div style="margin-bottom:10px;">' + titleHt + '</div>' +  
			'<div>' + pic + '</div>' +  
			'<div style="color:#B80000;margin-top:20px;" id="svc-rem" >Remove This Service<div></div>';
		
		return html;
	}
}
;
/**
 * Button Action Atom component. Action atoms components cause code execution in the system. Can thought off as the 
 * Mini Catalyst Controllers that alter the system's state. The acton button operates as the following:
 * 
 */
App.ButSmpl = function ()
{	
	// state variables
	var actionListener = undefined;
	var myId, myInst;
	
	// CSS defined here for button component
	this.css = { items:
    	[
		{name:'.btcls', 
			value:'border-style:solid;border-width:1px;border-radius:3px;border-color:#e3e3e3;'+
				'font-size:90%;text-align:center;padding:3px;background-color:#f5f5f5'}
		]
	}; 
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * atomObj:
	 * label: button label
	 * style: button style
	 * 
	 * config: 
	 * listener: action listener component (default none)
	 * 
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		myId = this.compId;
		myInst = this;
		
		if ( atomObj.name && atomObj.name.length>0 )
			myId = atomObj.name;
		
		var style = '';
		if (atomObj.style && atomObj.style.length>0 )
			style = atomObj.style;
		
		var cls = SA.localCss (myInst, 'btcls' );
		
		var label = atomObj.label;
		if ( !label )
			label = 'Label';
		
		var html = '<div id="' + myId + '" style="' + style + '" class="' + cls + '">' + label + '</div>'; 
		return html;
	}
	
	/**
	 * Change the label
	 */
	this.setLabel = function ( newLabel, newStyleObj )
	{
		var $id = $('#'+myId);
		$id.html ( newLabel );
		if ( newStyleObj ) {
			$id.css ( newStyleObj );
		}
	}
	
	/**
	 * Move to position
	 */
	this.moveTo = function ( x, y )
	{
		var $id = $('#'+myId);
		$id.css ('position', 'absolute');
		$id.css ('left', x);
		$id.css ('top', y );
	}
}
;
/**
 * Button Action Atom component. Action atoms components cause code execution in the system. Can thought off as the 
 * Mini Catalyst Controllers that alter the system's state. The acton button operates as the following:
 * 
 */
App.Button = function ()
{	
	// specify if the component contains state or not
	this.stateful = false;
	
	// state variables
	this.actionListener = undefined;
	this.selected = false;

	var myAtomObj = undefined;
	var listenerComp = undefined;
	var divId = undefined;
	
	// CSS defined here for button component
	this.css = {
	}; 
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * type: link | button  (create a link, default is button)
	 * glyphicon: glyphicon name to use with text (default none)
	 * theme: blank, color  (default color)
	 * listener: action listener component (default none)
	 * 
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		myAtomObj = atomObj;
		
		var gicon = SA.getConfig (atomObj, 'glyphicon' );
		
		var type = SA.getConfig (atomObj, 'type', 'button');
		var linkStyle = ( type == 'link' );
		
		var theme = SA.getConfig (atomObj, 'theme', 'color');
		var thcls = ( theme == 'blank' )? 'btn-default' : 'btn-warning';
		
		// set global listener comp
		if ( !listenerComp )
			listenerComp = SA.getConfig (atomObj, 'listener' );
		
		var defaultButton = SA.getConfig (atomObj, 'defButton', false);
		defaultButton = true;
		
		var label = atomObj.label;
		if ( !label ) {
			label = 'No Label';
		}
		var tooltip = '';
		if ( atomObj.info ) {
			tooltip = 'title="' + atomObj.info + '"';
		}
		
		var style = '';
		if ( atomObj.style ) {
			style = atomObj.style;
		}
		
		var giconCss = '';
		if ( gicon ) {
			giconCss = 'glyphicon ' + gicon;
		}
		
		// set div.id == compId (or name if exists), this way you can always lookup component instance from divId
		divId = this.compId;
		if ( atomObj.name )
			divId = atomObj.name;
		
		var retHtml = '';
		
		if ( linkStyle ) {
			style = (style=='')? 'float:left;padding:8px;padding-left:0px' : style ;
			
			retHtml = '<div style=""' + tooltip + '><a id="' + divId + 
			'" href="#" style="' + style + '">'+ label +'</a></div>';
		}
		else {
			style = (style=='')? 'margin-right:8px;' : style;
			
			var spanId = divId + '-span';
			
			if ( defaultButton ) {
				retHtml = '<button id="' + divId + '" ' + tooltip + ' style="' + style + 
					'" class="btn ' + thcls + '">'+
					'<span id="' + spanId + '" class="' + giconCss + '"></span>' + ' '+ label+'</button>'
			}
			else {
				retHtml = '<div id="' + divId + '" ' + tooltip + ' style="' + style + 
					'" class="btn ' + thcls + '">'+
					'<span id="' + spanId + '" class="' + giconCss + '"></span>' + ' '+ label+'</div>'
			}
		}
		return retHtml;
	}
	
	this.setWaiting = function ( isWaiting ) 
	{
		if ( isWaiting ) {
			$ ('#' + divId+'-span').addClass ( 
				'glyphicon glyphicon-refresh glyphicon-refresh-animate' );
		}
        else {
            $ ('#' + divId+'-span').removeClass ( 
            	'glyphicon glyphicon-refresh glyphicon-refresh-animate' );
        }
	}
	
	this.getName = function()
	{
		return this.atomObj.name;
	}
	
	/**
	 * If defined it will allow this component to be an action listener
	 */
	this.setActionListener = function ( listener )
	{
		listenerComp = listener;
	}
	
	/**
	 * Adds an action listener
	 */
	this.showSelected = function ( selected )
	{
		this.selected = selected;
		var id = this.id;
		
		if ( selected ) {
		    $("#" + id).addClass ( 'active' );
		}
		else {
		    $("#" + id).removeClass ( 'active' );
		}
	}
	
	/**
	 * Fire event to this action (click button, etc.)
	 */
	this.triggerEvent = function ( eventName )
	{
		var id = this.id;
		var select = $( "#" + id );
		if ( select )
			select.trigger( eventName );
	}
	
	var lastTimeStamp = 0;
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
		//var atomObj = this.atomObj;
		var divId = this.id;		// id can be compId or name (if provided)
		var compId = this.compId;	// compId
		var myComp = this;
		
		var vdiv = $("#" + divId);
		
		$('body').on('click', "#" + divId, function (e) {
			
			e.preventDefault();
			// prevent multi events
			if ( e.timeStamp - lastTimeStamp < 4 ) {
				return;
			}
			lastTimeStamp = e.timeStamp;
			
		    // if compId set in tlist, fire local link
		    if ( myAtomObj.tlist && myAtomObj.tlist.indexOf ('#compId:')==0 ) {
		    	// fire a click event to that component
		    	SA.events.fireEvent( myAtomObj.tlist.substring(8), 'click');
		    	return;
		    }
			
			// get div.id as compId
			var compId = divId;
			
		    // fire event
		    if ( listenerComp ) {
		    	listenerComp.performAction ( compId, myAtomObj, myComp );
		    }
		    
		    //check for ilist and tlist. If found, add the ilist as tlist child
		    if ( myAtomObj.tlist ) {		    	
				// load the ilist
				var ilist = SA.comps.getList ( myAtomObj.ilist )
				
				// now load the component's target list
				var tlist = SA.comps.getList ( myAtomObj.tlist );
				
				var html = '';
				
				// no list component at tlist just render ilist into div
				if ( !tlist.lc ) {
					html = SA.listCreateUI ( this.compId, ilist );
					if ( html )
						$('#' + tlist.name ).html ( html );
				}
				else {
					if ( ilist ) {
						if ( !tlist.items ) 
							tlist.items = new Array();
						
						tlist.items.push ( ilist );
					}
					// now render the tlist with ilist as its child (if exists) 
					var html = SA.listCreateUI ( compId, tlist );
					if ( html ) 	// if return value, set it
						tdiv.html ( html );
				}
		    }
		    
		    // show that is component is selected (no need to do this for button)
		    //thisComp.showSelected ( compId, true);
		});
	}
}
;
/**
 * Button Action Atom component. Action atoms components cause code execution in the system. Can thought off as the 
 * Mini Catalyst Controllers that alter the system's state. The acton button operates as the following:
 * 
 */
App.ButtonYN = function ()
{	
	var myId, myInst;
	var name, value;
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * value: yes | no
	 */
	this.createUI = function ( atom, allConfig )
	{
		myId = this.compId;
		myInst = this;
		var style = '';
		if ( atom.style ) {
			style = atom.style;
		}
		name = atom.name;
		value = atom.value;
		label = atom.label;
		
		var activeCls = '';
		if ( value && value==true ) {
			activeCls = 'active';
		}
		var retHtml = '<button id="' + myId + '" style="' + style + 
			'" type="button" class="btn btn-default ' + activeCls +'" data-toggle="button" >'+ label + '</button>';
		return retHtml;
	}
	
	this.getName = function()
	{
		return name;
	}
	
	this.getValue = function()
	{
		value = $('#'+myId).hasClass('active');
		return value;
	}
	
	this.postLoad = function ()
	{
		$('#'+myId).hammer().bind("tap", function(event) {
			if ( myInst.getValue() ) {
				$('#'+myId).blur();
			}
		});
	}
}

;
/**
 * Button Action Atom component. Action atoms components cause code execution in the system. Can thought off as the 
 * Mini Catalyst Controllers that alter the system's state. The acton button operates as the following:
 * 
 */
App.Circles = function ()
{	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { items:
		[
		{name:'.round', value:'display:block;width:15px;height:15px;border:1px solid #e5e5e5;'+
			'border-radius: 50%;box-shadow: 0 0 1px gray;float:left;margin-right:5px;'},
		{name:'.selected', value:'background: #e0e0e0;'}
		]			
	};
	
	var myId, myInst;
	var count, cls1, selCls;

	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config:
	 * count: number of circles
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		myInst = this;
		myId = this.compId;
		
		if ( atomObj.name ) {
			myId = atomObj.name;
		}
		
		count = SA.getConfig ( atomObj, 'count', 3 );
		cls1 = SA.localCss ( this, "round");	
		selCls = SA.localCss ( this, "selected");

		var html = '<div style="display:none" id="' + myId + '" />';
		return html;
	}
	
	/**
	 * Draw the actual circles based on layout
	 */
	this.draw = function ( ypos, selIdx )
	{
		var html = '';		
		for ( var i=0; i<count; i++ ) {
			html += '<div id="' + (myId+'-'+i) + '" class="'+ cls1 + '" />'; 
		}
		var winWidth = $(window).width();
		var circWidth = count * 20;
		var xpos = (winWidth - circWidth) / 2;
				
		var $div = $('#'+myId);
		$div.html ( html );
		$div.css ('position', 'absolute');
		$div.css ('top', ypos+'px' );
		$div.css ('left', xpos+'px' );		
		$div.show ();
		
		selectIdx ( selIdx );
	}
	
	/**
	 * Adds an action listener
	 */
	function selectIdx ( idx )
	{
		$( '#' + (myId+'-'+idx) ).addClass ( selCls );	
	}

}


;/**
 * Button Action component
 */
App.Dialog = function ()
{	
	// specify if the component contains state or not
	this.stateful = true;
	
	// store obj-based templ here
	this.htmlTempl = undefined;
	
	this.css = { items: 
		[
			/* Everything else */
			{name: '@media (min-width: 481px)', items: 
				[
				{name:'.dlg', value:'width:520px;position:absolute; '+
					'top:6%;left:45%;margin-top:-30px;margin-left:-200px;padding:20px;' }
				]
			},
			 
			/* Mobile sizes */
			{name: '@media (max-width: 480px)', items:
				[
				{name:'.dlg', value:'width:100%;position:absolute;top:0px;margin-top:0px;padding:0px;margin-left:0px' },
				{name:'.dlg-sml', value:'width:90%;position:absolute;top:20%;margin-left:16px;padding:0px;' }
				]
			}
		]
	};	
	
	var dlgId = undefined; 
	var pageId = undefined;
	var isPageStyle = undefined;
	var myFlowList = undefined;
	var dlgFormComp = undefined;
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * flow: Optional expect child list of content of dialog
	 * 
	 */
	this.createUI = function ( flowList, allConfig )
	{
		var pageConfig = SA.getConfig ( flowList, 'pageStyle', false );
		var small = SA.getConfig (  flowList, 'small' );
		
		// get is page style (full page or dialog)
		var isMobile = SA.utils.isMobileDevice();
		isMobile = true;
		isPageStyle = pageConfig && isMobile;
		
		// The dlgId initialized in DOM, if already there simply show it ( If NOT in DOM create one)
		if ( dlgId ) {
			return '';
		}
		
		// initialize dlgId
		dlgId = this.compId;
		pageId = dlgId + '-page';
		
		myFlowList = flowList;
		
		// fihure out title
		var title = flowList.label;
		if ( !title ) {
			title = 'No title provided in label field';
		}
		
		var style = '';
		if ( flowList.style ) {
			style = flowList.style;
		}
		
		// content stored here
		var content = '';
		if ( flowList.items &&  flowList.items.length>0 ) {
			content = SA.listCreateUI ( this.compId, flowList.items[0], {'pageStyle':isPageStyle} );
		}
		
		// local css cls
		var ldlgcss = SA.localCss (this, 'dlg');
		if ( small == true )
			ldlgcss = SA.localCss (this, 'dlg-sml');
			 
		var retHtml = '<div class="modal fade" id="'+ dlgId + '" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">'+
	
		'<div class="modal-dialog ' + ldlgcss + '" style="' + style + '" >' +
			'<div id="' + pageId + '" class="modal-content">' +
				'<div class="modal-body" style="height:100%;width:100%;" >'+
					content +  
				'</div>'+
			'</div>'+
		  '</div>'+
	    '</div>';

		// Create an element with id == flowList.name ( or eq divElementId )
		$("#page-etc").append("<div id='" + flowList.name + "'></div>" );

		// Now append the dlg html inside the div set the html value
		$( "#"+flowList.name ).html ( retHtml );

		return undefined;
	}
	
	/**
	 * Make dialog and contents wait for processing
	 */
	this.setWaiting = function ( isWaiting )
	{
		 var form = getDialogForm();
		 if ( form ) {
			 form.setWaiting ( isWaiting );
		 }
	}
	
	/**
	 * Show and hide dialog
	 */
	this.showDialog = function ( show, title, bannerName, noToolbar  )
	{
		if ( isPageStyle ) {
			var appBanner = SA.lookupComponent ( bannerName );
			if ( show ) 
				appBanner.showNextPage ( title, pageId, $('#'+pageId).html(), undefined, noToolbar );
			else
				appBanner.showPrevious ();
		}
		else {
			if ( show ) 
				$('#'+dlgId).modal({ show: show  });
			else 
				$('#'+dlgId).modal('hide');
		}
	}
	
	/**
	 * Update the form with new one (used for edit mode)
	 */
	this.updateForm = function ( valuesObj )  
	{
		 var form = getDialogForm();
		 if ( form ) {
			 form.updateForm ( valuesObj )
		 }
	}
	
	/**
	 * Show and hide form element
	 */
	this.showElement = function ( name, show)
	{ 
		 var form = getDialogForm();
		 if ( form ) {
			 form.showElement ( name, show );
		 }
	}
	
	/**
	 * Gets the underlaying dialog form 
	 */
	function getDialogForm ()
	{
		if ( !dlgFormComp ) {
			 var formName = myFlowList.items[0].name;
			 dlgFormComp = SA.comps.getCompByIdOrName(formName);
		}
		return dlgFormComp;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{ 
	}
}
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.DlgHelper = function ()
{
	// Other variables
	var myInst, myId ;
	var dialogHandler;
	var initialized = false;	
	var okDlgInit = false;	
	
	var mleftO = $(window).width()/2 - 70;
	var mleft1 = $(window).width()/2 - 130;
    
    // delete dialog
    var yesNoDialog =  { items: 
		[
	    {name:'dh-yesno', lc:'App.Dialog', config:{small:true}, items:
			[
			{name:'dh-yesno-form', lc:'App.FormHandler', 
				config:{title:'', listener:this}, items: 
				[
				{html:'div', style:'height:25px;'},
				{name:'dh-id', ac:'App.Variable'},				
				{name:'dh-yesNoMsg', html:'p', style:'text-align:center;font-size:110%', value:''},
				{html:'div', style:'height:6px;'},
				
			    {cmd:'dh-cmdYes', ac:'App.Button', label:'Yes I am Sure', config:{theme:'color'},
					style:'margin-left:'+mleft1+'px;margin-right:5px;'},
			    {cmd:'dh-cmdNo', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
			    
			    {html:'div', style:'height:5px;'}
				]
			}
			]
		}
	    ] };
    
    // delete dialog
    var okDialog =  { items: 
		[
	    {name:'dh-ok', lc:'App.Dialog', config:{small:true}, items:
			[
			{name:'dh-ok-form', lc:'App.FormHandler', 
				config:{title:'', listener:this}, items: 
				[
				{html:'div', style:'height:25px;'},			
				{name:'dh-okMsg', html:'div', value:''},
				{html:'div', style:'height:6px;'},
				
			    {cmd:'dh-cmdOk', ac:'App.Button', label:'Close', config:{theme:'color'},
			    	style:'margin-left:'+mleftO+'px' },
			    
			    {html:'div', style:'height:5px;'}
				]
			}
			]
		}
	    ] };    
    
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 */
	this.createUI = function ( list, config )
	{
		myId = this.compId;
		myInst = this;
	}
	
	/**
	 * 
	 */
	this.showOKDialog = function ( msgHtml  )
	{
		if ( okDlgInit == false ) {
			okDlgInit = true;
			SA.createUI (myId, okDialog);	
		}
		var dlg = SA.lookupComponent ( 'dh-ok' );
		if ( dlg ) {
			var form = {'dh-okMsg':msgHtml };
			dlg.updateForm (form );
			dlg.showDialog (true);
		}
	}
	
	/**
	 * 
	 */
	this.showYNDialog = function ( msg, id, handler )
	{
		if ( initialized == false ) {
			initialized = true;
			SA.createUI (myId, yesNoDialog);	
		}
		
		var dlg = SA.lookupComponent ( 'dh-yesno' );
		if ( dlg ) {
			// set handler
			dialogHandler = handler;
			
			var form = {'dh-yesNoMsg':msg, 'dh-id':id };
			dlg.updateForm (form );
			dlg.showDialog (true);
		}
	}
		
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		var dlg;
		if ( actionAtom.cmd == 'dh-cmdYes' ) {
			dlg = SA.lookupComponent ( 'dh-yesno' );
			dlg.setWaiting ( true );
			// answer caller 'YES'
			dialogHandler ( 'YES', dataObj ['dh-id'] );
			// disable waiting 
			dlg.setWaiting ( false );
			dlg.showDialog (false);
		}
		else if ( actionAtom.cmd == 'dh-cmdNo' ) {
			dlg = SA.lookupComponent ( 'dh-yesno' );
			dlg.showDialog (false);
			// answer caller 'NO'
			dialogHandler ( 'NO', dataObj ['dh-id']);
		}
		else if ( actionAtom.cmd == 'dh-cmdOk' ) {
			dlg = SA.lookupComponent ( 'dh-ok' );
			dlg.showDialog (false);
		}
	}	
}
;
/**
 * Text Area component
 */
App.EnumField = function () 
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;
	
	this.actionListener = undefined;
	this.atomObj = undefined;
	
	// remember value entered
	var fieldValue = '';
	var divId = undefined;
	var idsArray = new Array ();
	var clickCls = undefined;
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { items: 
		[
		/* Everything else 
		{name: '@media (min-width: 481px)', items: 
			[
			]
		},
		 
		// Mobile sizes 
		{name: '@media (max-width: 480px)', items: 
			[
			]
		},
		*/
		]
	};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * type: 'password', 'text'
	 * 
	 * child list: atom fields:
	 * info: info inside field
	 * label: label outside field
	 */
	this.createUI = function ( atomObj, config )
	{
		this.atomObj = atomObj;		
		divId = this.compId;
		
		var placeHolder = '';
		
		var type = SA.getConfigValue (atomObj, 'type', 'text');
		var typeStr = 'type="' + type + '"';
		var labelStr = '';

		// get info
		if ( atomObj.info ) {
			placeHolder = 'placeholder="' + atomObj.info + '"'; 
		}
		
		// get label
		if ( atomObj.label ) {
			labelStr = '<label class="col-md-3 control-label" for="email">'+ atomObj.label +'</label>';
		}
		
		var values = atomObj.values;
		if ( !values || values.length == 0 ) {
			alert ( "Invalid State: expected 'values' array with name value objects");
		}
		
		fieldValue = atomObj.value;
		if ( !fieldValue ) {
			fieldValue = '';
		}
		// class to handle click event
		clickCls = makeId ( 'clkgrp');
		
		// UI created here (Remember! use id will allow the postLoad notification)
		var html =
		'<div id="'+ divId + '" class="form-group" >'+
		  '<div class="col-md-12">' + 
			'<div class="btn-group">';
			
		for ( i=0; i<values.length; i++ ) {
			var valObj = values [i];
			var cls = (valObj.name==fieldValue || valObj.value==fieldValue)? 'active' : '';
			cls += ' ' +clickCls;
			
			var id = makeId(valObj.name);
			idsArray.push ( id )
			html += '<button type="button" class="btn btn-default ' + cls + '" id="' + id + '">' + 
				valObj.value + '</button>';
		}
		html += '</div></div></div>';  
		
		// get local css name (i.e. css name defined in this object)
		//var cssName = SA.localCss(this, 'round-clear');
		
		return html;
	}
	
	/**
	 * Make id from divId + idVal
	 */
	function makeId ( idVal )
	{
		return idVal + '-' + divId ;
	}
	
	/**
	 * getValue() needed for FORM atom component (work with FormHandler)
	 */
	this.getValue = function ()
	{
		return fieldValue;
	}
	
	/**
	 * getName() needed for FORM atom component  (work with FormHandler)
	 */
	this.getName = function()
	{
		return this.atomObj.name;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
		// handler to the click group class
		$('.' + clickCls).click ( function() {
			fieldValue = $(this).attr ( "id" ); 
		    $(this).addClass ( 'active' );
		    deSelectIds ( fieldValue );
		});
	}
	
	/**
	 * Go through list and make one id active
	 */
	function deSelectIds ( butId )
	{
		for ( i=0; i<idsArray.length; i++ ) {
			if ( idsArray[i] != butId ) {
				var $id = $( '#'+ idsArray[i] );
				if ( $id.hasClass ('active'))
					$id.removeClass ( 'active' );				
			}
		}
	}
}

;
/**
 * Create data entry form handler
 */
App.FormHandler = function ()
{
	// create new instance every time referenced in list
	this.stateful = true;
	
	// form listener
	var formListener ;
	
	// components in this form
	var compsList = new Array ();
	
	// define my form id
	var myId ;
	
	// my current flow list
	var myFlowList;
	
	// local css names
	var formCss ;
	var headerCss;
	
	// my comp
	var thisComp ;
	var title ;
	var pageStyle ;
	var fitHeight;
	
	// comp trigger action
	var triggeringComp ;
	
	this.css = { items: 
		[
			/* Everything else */
			{name: '@media (min-width: 481px)', items: 
				[
				{name:'.header', value:'padding:0px;font-size:135%;margin:0 0 0 0;'},				 
				{name:'.form', value:'width:90%;padding:15px;font-size:110%;'}				 
				]
			},
			 
			/* Mobile sizes */
			{name: '@media (max-width: 480px)', items: 
				[
				{name:'.header', value:'padding:0px;font-size:130%;margin:0 0 0 0;'},			 				 
				{name:'.form', value:'width:100%;font-size:85%;'}
				]
			}
		]
	};	
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * items:
	 * All Action Atom objects in a list will be placed in form
	 * html elements will be static elements on form
	 * 
	 * config:
	 * listener: the listener component
	 * title: login form title
	 * fitHeight: true/false to fit in height of window
	 * 
	 */
	this.createUI = function ( flowList, allConfig )
	{
		myFlowList = flowList;
		thisComp = this;
		formListener = SA.getConfig ( flowList, 'listener' );
		fitHeight = SA.getConfig ( flowList, 'fitHeight');
		
		if ( !flowList.items )
			return;
		
		// get form ID
		myId = this.compId;
		if ( flowList.name ) {
			myId = flowList.name;
		}
		
		// local form css
		formCss = SA.localCss ( this, 'form' );
		headerCss = SA.localCss ( this, 'header' );
		
		// page style ?
		pageStyle = SA.getConfig ( flowList, 'pageStyle', false );
		
		var style = 'margin:20px';
		if ( flowList.style && flowList.style.length>0 )
			style = flowList.style;
		
		// col-md-8 col-md-offset-2
		
		var retHtml;
		if ( pageStyle ) {
			retHtml =
			'<div id="'+myId+'" style="'+ style +'" >'  +
				createFormUI ( flowList ) + 
			'</div>'; 
		}
		else {
			retHtml =
			'<div id="' + myId + '" class="container ' + formCss + ' style="'+ style +'" >'  +
				createFormUI ( flowList ) + 
			'</div>';
		}
		return retHtml;
	}
	
	/**
	 * Updates form data
	 */
	this.updateForm = function ( dataObj )
	{
		// merge my data list + data obj
		SA.utils.mergeList(myFlowList, dataObj);
		var retHtml = createFormUI ( myFlowList );
		
		// update ui
		$( '#' + myId ).html (retHtml);
	}
	
	/**
	 * Creates form UI 
	 */
	function createFormUI ( flowList )
	{
		compsList = new Array ();
		var atomList = flowList.items;

		// set div.id == compId, this way you can always lookup component instance from divId
		var divId = this.compId;
		title = SA.getConfigValue ( flowList, 'title' );
		
		var titleLine = '';
		if ( !pageStyle && title && title.length>0 ) {
			titleLine = 
			'<div class="panel-heading" style="border-bottom:0px;">';
				'<p class="' + headerCss + '" >' + title + '</p>' + 
			'</div>' ;
		}
		
		var winHeight = '';
		if ( fitHeight ==  true ) { 
			winHeight = 'height:' + (window.innerHeight-5) + 'px';
		}
		
		var retHtml = 
		'<div class="panel panel-default" ' + 
			'style="border-width:0px;background-color:transparent;box-shadow:none;-webkit-box-shadow:none;' +winHeight+ '">' +		
			titleLine +			 		
			'<div class="row">' +
				'<div class="col-md-12">' +
			  	    '<div>' + 
					   '<form class="form-horizontal" action="" method="post">' ;
				  		   //'<div style="padding-bottom:15px;" />' ;
				  
		// now add all the buttons inside
		var j = 0;
		for ( j=0; j<atomList.length; j++ ) {
			var lobj = atomList [j];
			
			// if not atom component, just render  
			if ( !lobj.ac ) {
				retHtml += SA.listCreateUI ( lobj.compId, lobj, undefined, true );
				continue;
			}
			
			// get atom comp
			var atomComp = SA.getAtomComponent ( lobj.name, lobj.ac );
			compsList.push ( atomComp );
			
			// if button implements setActionListener method, call it and asso my self with it
			if ( atomComp.setActionListener ) 
				atomComp.setActionListener ( thisComp );
				
			// get html
			var html = atomComp.createUI ( lobj, null );
			
			retHtml += html;
		}
		retHtml += '</form></div></div></div></div>';

		return retHtml;
	}
	
	/**
	 * show / hide form element
	 */
	this.showElement= function ( elementName, show ) 
	{
		if ( !show ) {
			$ ('#' + elementName).hide ();
		}
		else { 
			$ ('#' + elementName).show ();
		}
	}
	
	/**
	 * Component that gets notified about form events
	 */
	this.addFormListener = function ( listener )
	{
		formListener = listener;
	}
	
	/**
	 * Set or reset waiting (when action is being perform)
	 */
	this.setWaiting = function ( isWaiting )
	{
		if ( triggeringComp && triggeringComp.setWaiting ) {
			triggeringComp.setWaiting ( isWaiting );
		}
		if ( isWaiting) {
			$('#' + myId).find(':input').prop('disabled', true);
		}
		else {
			$('#' + myId).find(':input').prop('disabled', false);
		}
	}
	
	/**
	 * The child components call this when an action is performed (i.e. key press)
	 */
	this.performAction = function ( compId, actionAtom, actionComp )
	{
		//console.log ( "action performed ");
		
		// notify form listener 
		if ( formListener ) {
			if ( formListener.notifySubmit ) {
				triggeringComp = actionComp;
				
				// get data objects from form
				var dataObj = getFormDataInt( compsList );

				// pass to listener
				formListener.notifySubmit (actionAtom, myFlowList.items, dataObj );
			}
		}
	}
	
	/**
	 * Gets form data after filled 
	 */
	this.getFormComps = function ()
	{
		return compsList;
	}
	
	/**
	 * Gets form component object
	 */
	this.getFormComponent = function ( compName )
	{
		for (i=0; i<compsList.length; i++ ) {
			var c = compsList[i];
			if ( c.getName && c.getName == compName ) {
				return c;
			}
		}
	}
	
	/**
	 * Programatically add components to form
	 */
	this.addComponent = function ( name, compObj )
	{
		var comp = SA.getAtomComponent ( name, compObj );
		compsList.push ( comp );
	}
	
	/**
	 * Remove form component 
	 */
	this.removeComponent = function ( name )
	{
		var i;
		for (i=0; i<compsList.length; i++ ) {
			var cmp = compsList[i];
			if ( cmp.getName ) {
				var cname = cmp.getName();
				if ( cname == name ) {
					compsList.splice (i,1);
					if ( $('#'+cmp.compId).length>0 ) {
						$('#'+cmp.compId).hide();
					}
					else { 
						$('#'+name).hide();
					}
					break;
				}
			}
		}
	}
			
	/**
	 * Gets form data from all child components 
	 */
	function getFormDataInt ( compsList )
	{
		var data = {};
		
		for (i=0; i<compsList.length; i++ ) {
			
			var c = compsList [i];
			// component need a name to be placed on form
			if ( c.getName && c.getValue ) {
				var name = c.getName();
				var value = c.getValue();
				if ( value != undefined ) {
					if ( value != '' ) {
						data [ name ] = value ;
					}
					else if ( value==true || value==false ) {
						data [ name ] = value;
					}
				}
			}
		}
		return data;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created)
	 */ 
	this.postLoad = function ()
	{
	}
}
;
/**
 * Shows a link in a frame
 */
App.LinkFrame = function ()
{	
	var myId ;
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 */
	this.createUI = function ( atomObject, config )
	{
		var html = '';
		
		var srcUrl = config.srcUrl;
		if (!srcUrl) srcUrl = '';
		
		myId = this.compId;
		
		var height = ($(window).height() - 50) + 'px';
		
		// header
		html += '<iframe style="width:100%;height:'+height+';border:0px;" src="' +srcUrl + 
		'" id="' + myId + '"></iframe>';
		
		return html;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{

	}
}

;
/**
 * Text Area component
 */
App.Loading = function () 
{		    
    var myId = undefined;
    
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 */
	this.createUI = function ( atomObj, config )
	{
		myId = 'load-' + this.compId;
		var html = getIconHtml();
		
		// Create an element with id == flowList.name ( or eq divElementId )
		var $etc = $("#page-etc");
		if ( !$etc.length  ) {
			$etc = $('<div id="page-etc" />').appendTo('body');
			$etc.append ( html );
		}
		return '';
	}
	
	/**
	 * Show icon centered in page
	 */
	function getIconHtml ()
	{
		var winWidth = $(window).width();
		var winHeight = $(window).height();
		
		var divHeight = 50;
		var top = winHeight/2 - divHeight/2 - 20;
		
		var divWidth = 80;
		var left = winWidth/2 - divWidth/2 + 25;
		var imgWidth = divWidth /3;
		
		var nstyle = 'display:none;border-radius:10%;position:fixed;top:' + top + 
			'px;left:' + left + 'px;z-index:1000;width:' + divWidth + 'px;height:' + divHeight + 'px';
		
		var html = '<div id="' + myId + '" style="' + nstyle + '" >' + 
			'<img src="app/res/img/350.gif" width="' + imgWidth +'" /></div>';

		return html;
	}
	
	/**
	 * start animation 
	 */
	this.start = function ()
	{
		var $myId = $('#'+myId);
		$myId.show ();
	}
	
	/**
	 * Stop animation 
	 */
	this.stop = function ()
	{
		var $myId = $('#'+myId);
		$myId.hide ();
	}
}

;
/**
 * Message component for displaying messages in the UI 
 */
App.Message = function ()
{
	// local css classes
	this.css = { items: 
		[
		{name: '.errmsg', value: 'padding:0px;font-weight:normal;color:#ff6600;font-size:105%;' },
		{name: '.okmsg', value: 'padding:0px;font-weight:normal;color:#00CC00;font-size:105%;' }		
		]
	};
	
    var cssErrMsg = undefined;
    var cssOkMsg = undefined;
    var myId = undefined;
	
	/**
	 * This method creates the UI based on the lists provided
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		myId = atomObj.name;
		
		cssErrMsg = SA.localCss (this, 'errmsg');
		cssOkMsg = SA.localCss (this, 'okmsg');
		
		var style = atomObj.style;
		
		if ( style )
			return '<div style="' + style + '" class="' + cssErrMsg + '" id="' + myId + '" ></div>';
		else 
			return '<div class="' + cssErrMsg + '" id="' + myId + '" ></div>';
	}	
	
	/**
	 * show message method called from ouside object
	 */
	this.showMessage = function ( msg, success )
	{
		var $div = $( '#'+myId );
		$div.hide ();
		
		if ( !success ) {
			$div.removeClass ( cssOkMsg );
			$div.addClass ( cssErrMsg );			
		}
		else {
			$div.removeClass ( cssErrMsg );
			$div.addClass ( cssOkMsg );			
		}
		$div.html (  msg );	
		$div.fadeIn ( 'slow' );	
		
		setTimeout(function(){
			$div.fadeOut ( 'slow' );
		}, 4000);
	}
}
;/**
 * Page flipper component that will slide content back and forth 
 */
App.PageFlip = function ()
{
	// stylesheets for this component
	this.css = { items: 
		[
        /* Everything else */
        {name: '@media (min-width: 481px)', items: 
            [
            {name:'fcls', value:'width:500px;height:400px;background-color:#f9f9f9;'}
            ]
        },

        /* Mobile sizes */
        {name: '@media (max-width: 480px)', items: 
            [
            {name:'fcls', value:'width:100%;height:400px;background-color:#f9f9f9;'}             
            ]
        }
		]
	};
	
	var myId,  myComp, butNext, butPrev;
	var listener;
	var pageIdx = 0; // start before first page
	var maxPages  = 0;
	var selfHandle = false;
		
	// pages array to keep info about pages such as div name, etc.  
	var pagesArray = new Array();
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * Optional configuration:
	 * 
	 * // Based on images
	 * config: {
	 *    pages: [
	 *		{title:'page1', img:'app/res/img/image1.jpg', html:'xxx'},    	
	 *		{title:'page2', img:'app/res/img/image2.jpg', html:'xxx'}    	
	 *    ]
	 * }
	 */  
	this.createUI = function ( listObj, allConfig )
	{
		myId = this.compId;
		myComp = this;
		
		selfHandle = SA.getConfig (listObj, 'selfHandle');

		if ( listObj.config && listObj.config.pages  ) {
			var pages = listObj.config.pages;

			for (i=0; i<pages.length; i++ ) {
				var id = 'pf-'+ i + '-';
				var p = { name:id+myId, id:i, title:pages[i].title, html:getPageHtml(pages[i]) };
				pagesArray.push ( p );
			}
			maxPages = pages.length;
		}
		else {
			// fill in dummy values 
			for (i=0; i<3; i++ ) {
				var id = 'pf-'+ i + '-';
				var p = { name:id+myId, id:i, title:'t'+i, html:'' };
				pagesArray.push ( p );
			}
			maxPages = 0;
		}

		var fcls = SA.localCss (this, 'fcls');
		
		// gen html
		var html = '<div id="' + myId + '" class="' + fcls +'" >';
		for ( i=0; i<pagesArray.length; i++ ) {
			html += '<div id="' + pagesArray[i].name + '" style="display:none" ></div>';
		}
		html += '</div>';
		
		// get listener if available, save it
		if ( listObj.config.listener ) {
			listener = listObj.config.listener;
		}

		if ( maxPages > 0 ) {
			SA.fireEvent (myId, {cmd:'refresh'} );
		}
		return html;
	}
	
	/**
	 * Reset values
	 */
	this.reset = function ()
	{
		pageIdx = 0;
	}
	
	/**
	 * Get current page index
	 */
	this.curPageIdx = function ()
	{
		return pageIdx;
	}
	
	/**
	 * Handle custom event
	 */
	this.handleEvent = function ( event )
	{
		//console.debug ('handle event: ' + event.cmd );
		if ( event.cmd == 'refresh' ) {
			myComp.showNext();
		}
	}
		
	/**
	 * Get img html from path
	 */
	function getPageHtml ( pageObj )
	{
		if ( pageObj.img ) 
			return '<img src="' + pageObj.img + '" width="100%" />';
		else if ( pageObj.html )
			return pageObj.html;
		else 
			return '';
	}

	/**
	 * GO BACK: Slide panel right (go left)
	 */
	function slideRight ( $prev, $next, clear )
	{
		var winWidth = $(window).width();		
		if ( !allowSlide(winWidth) ) {
			if (clear ) {
				$next.html ('');
			}
			$next.hide();
			$prev.fadeIn ('slow');
			return;
		}		
		var nleft =  winWidth+'px';
		$next.css('width', winWidth+'px' );
		
		$prev.show();
		
 		$next.animate({"left":nleft}, "fast", function() {
			if (clear ) {
				$next.html ('');
			}
		});
	}
	
	/**
	 * GO NEXT: Slide panel left (go right)
	 */
	function slideLeft ( $prev, $next )
	{
		var winWidth = ($prev)? $prev.width() : $(window).width();
		var prevLeft = ($prev)? $prev.position().left : 0;
		if ( !allowSlide(winWidth) ) {
			$prev.hide();
			$next.fadeIn ('slow');
			document.location.href="#top";			
			return;
		}
		var zindex = 10 * pageIdx;
		$next.css( {'z-index': zindex} );
		
		// next div attributes 
		var top = 0 ;	// banner and tb
		$next.css( 'position', 'fixed' );
		$next.css( 'overflow-y', 'scroll' );
		$next.css( '-webkit-overflow-scrolling', 'touch' ); 						
		$next.css( 'top', 0+'px' );
		$next.css( 'padding-top', top+'px' ); 		
		$next.css( 'height', '100%'  );
		
		var nleft = winWidth; 
		$next.css('left', nleft+'px');
		$next.css('width', winWidth+'px' );
        
        // show next div
		$next.show();
		// hide panel before slide reduces flicker
		/*
		if ($prev) {
			$prev.hide();
		}
		*/
		$next.animate({"left":prevLeft+'px'}, "fast", function() {
			//hide prev
			$prev.hide();
		});
	}
	
	/**
	 * Show next page (wraps around) of data already set in slider
	 */
	this.showNext = function ()
	{
		if ( pageIdx >= pagesArray.length ) {
			pageIdx = 0;
		}
		myComp.showNextPage ( pagesArray[pageIdx].id,  
				pagesArray[pageIdx].title, pagesArray[pageIdx].html );
		
		// notify about the show next event
		if ( listener )
			listener.actionPerformed ( {cmd:'showNext', curIdx:pageIdx-1} );
	}
	
	/**
	 * Shows previous page
	 */
	this.showPrev = function ()
	{
		if ( pageIdx == 1 ) {
			pageIdx = maxPages;
			return;
		}
		lastDataId = 0;
		pageIdx--;
		
		var $p0 = $('#' + pagesArray [pageIdx-1].name );
		var $p1 = $('#' + pagesArray [pageIdx].name );
		
		var clear = true;
		
		slideRight ( $p0, $p1, clear );
		
		// back to oroginal position
		//var scrollYPos = pagesArray[pageIdx].ypos;
		//scrollToYPos ( scrollYPos );
		
		// notify about the show next event
		if ( listener )
			listener.actionPerformed ( {cmd:'showPrev', curIdx:pageIdx-1} );
	}
	
	/**
	 * Show page html (as next page and then user can go back)
	 */
	this.showNextPage = function ( dataId, title, pageHtml ) 
	{
		if ( pageIdx == 0 ) {
			clearAllHtml ();
			var $fp = $('#' + pagesArray [0].name );

			$fp.html ( pageHtml);
			$fp.css( 'position', 'fixed' );
			$fp.css( 'overflow-y', 'scroll' );
			$fp.css( '-webkit-overflow-scrolling', 'touch' ); 
			$fp.css( 'height', '100%'  );
			$fp.css( 'width', '100%'  );
			
			$fp.fadeIn ('fast');
			pageIdx++;
			return;
		}
		lastDataId = dataId;
		
		pagesArray [pageIdx].title = title;
		pagesArray [pageIdx].dataId = dataId;
		// Get current page TB state
	
		var $p0 = $('#' + pagesArray [pageIdx-1].name );
		var $p1 = $('#' + pagesArray [pageIdx].name );
		
		// get scroll top Y position
		//pagesArray[pageIdx].ypos = $(window).scrollTop();
			
		$p1.hide();
		$p1.html ( pageHtml );
		
		//document.location.href="#top";		
		slideLeft ( $p0, $p1 );
		pageIdx++;
	}
	
	/**
	 * Clear all html from pages
	 */
	function clearAllHtml ()
	{
		for (i=0; i<pagesArray.length; i++ ) {
			$('#'+pagesArray[i].name).hide();
		}
	}
	
	/**
	 * return true is allowed slide affect
	 */
	function allowSlide ( winWidth )
	{
		//return winWidth < 500 && SA.utils.isMobileDevice();
		return true;
	}

	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created)
	 */ 
	this.postLoad = function ()
	{
		// Next page
		if ( selfHandle == true ) {
			$('#' + myId ).hammer().bind( "swipeleft", function( event ) {			
				//console.log ( '<-- swipe' );
				if ( !accept (event) ) return;
				//console.log ( '<-- swipe ts: ' + event.timeStamp );
				myComp.showNext ();
			});
			
			// Prev page
			$('#' + myId ).hammer().bind( "swiperight", function( event ) {
				//console.log ( 'swipe -->' );
				if ( !accept (event) ) return;
				//console.log ( 'swipe --> ts: ' + event.timeStamp );
				myComp.showPrev();
			});	
			
			$('#' + myId ).hammer().bind("tap", function(event) {
				if ( !accept (event) ) return;
				//console.log ( 'tap ts: ' + event.timeStamp);			
			});
		}
			
		// accept event
		var lastTime = 0;
		function accept (event ){
			var ret = event.timeStamp > lastTime;
			lastTime = event.timeStamp;
			return ret;
		}
	}
	
	/**
	 * Scroll page for mobile and browsers
	 */
	function scrollToYPos ( ypos )
	{
		if ( SA.utils.isMobileDevice() ) {
			window.scrollTo (0, ypos);
		}
		else {
			$('html, body').animate({
			    scrollTop: ypos,
			    scrollLeft: 0
			}, 0);
		}
	}
};
;/**
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

;
/**
 * Text Area component
 */
App.TextArea = function ()
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;
	
	this.actionListener = undefined;
	this.atomObj = undefined;
	
	// remember value entered
	var fieldValue = '';
	var divId, atomObj;
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { 
	};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * rows: number of rows
	 * cols: number of columns 
	 */
	this.createUI = function ( myObj, config )
	{
		atomObj = myObj;
		divId = this.compId;
		
		if ( atomObj.name )
			divId = atomObj.name;
		
		//var rows = SA.getConfig ( atomObj, 'rows', 3);
		var rows = 1;	// autosize based on text
		var cols = SA.getConfig ( atomObj, 'cols', -1 );
		var style = SA.getConfig ( atomObj, 'style', '' );
		
		var placeHolder = '';
		
		if ( atomObj.info ) {
			var reqtext = '';
			//if ( atomObj.required ) 
				//reqtext = ' (required)';
			placeHolder = ' placeholder="' + atomObj.info + reqtext + '"'; 
		}

		// get label
		var labelStr = '';
		if ( atomObj.label ) {
			labelStr = '<label class="col-md-3 control-label" for="email">'+ atomObj.label +'</label>';
		}
		
		fieldValue = atomObj.value;
		var valStr = '';		
		if ( fieldValue && fieldValue != '' ) {
			valStr = fieldValue;
		}		
		else {
			fieldValue = '';
		}
		
		var html =
		'<div class="form-group" >'+ labelStr +   
			'<div class="col-md-12">' +
		  		'<textarea style="font-size:110%;overflow:hidden;' + style + '" class="form-control" id="' + 
		  			divId + '" ' + placeHolder +' >' + fieldValue + '</textarea>' +
		  	'</div>' +
		'</div>';
		
		SA.fireEvent ( divId );
		
		return html;
	}
	
	this.getValue = function ()
	{
		fieldValue = $("#" + divId).val();
		return fieldValue;
	}
	
	this.getName = function()
	{
		return atomObj.name;
	}
	
	this.refresh = function ()
	{
		SA.fireEvent ( divId );
	}
	
	this.handleEvent = function ( event )
	{
		$ta = $('#'+divId);
		$ta.textareaAutoSize();
	}	
}
;
/**
 * Text Area component
 */
App.TextField = function () 
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;
	
	this.actionListener = undefined;
	this.atomObj = undefined;
	
	// remember value entered
	var fieldValue = '';
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = {
	};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * type: 'password', 'text', 'email'
	 * 
	 * child list: atom fields:
	 * info: info inside field
	 * label: label outside field
	 */
	this.createUI = function ( atomObj, config )
	{
		this.atomObj = atomObj;		
		var divId = this.compId;
		
		var placeHolder = '';
		
		var type = SA.getConfigValue (atomObj, 'type', 'text');
		var typeStr = 'type="' + type + '"';
		var labelStr = '';

		// get info
		if ( atomObj.info ) {
			var reqtext = '';
			//if ( atomObj.required ) 
				//reqtext = ' *';
			placeHolder = 'placeholder="' + atomObj.info + reqtext + '"'; 
		}
		
		// get label
		if ( atomObj.label ) {
			labelStr = '<label class="col-md-3 control-label" for="email">'+ atomObj.label +'</label>';
		}
		
		fieldValue = atomObj.value;
		var valStr = '';		
		if ( fieldValue && fieldValue != '' ) {
			valStr = 'value="' + fieldValue + '" ';
		}
		
		// form created here
		var html =
		'<div class="form-group">'+ labelStr + 
			'<div class="col-md-12">' +
		  		'<input '+ typeStr + ' style="font-size:110%;" class="form-control" id="' + 
		  			divId + '" ' + valStr + placeHolder +' />' +
		  	'</div>' +
		'</div>';
		
		// get local css name (i.e. css name defined in this object)
		//var cssName = SA.localCss(this, 'round-clear');
		
		return html;
	}
	
	/**
	 * getValue() needed for FORM atom component (work with FormHandler)
	 */
	this.getValue = function ()
	{
		fieldValue = $("#" + this.compId).val();
		return fieldValue;
	}
	
	/**
	 * getName() needed for FORM atom component  (work with FormHandler)
	 */
	this.getName = function()
	{
		return this.atomObj.name;
	}	
}
;
/**
 * Text Area component
 */
App.UploadSmpl = function () 
{	
	// remember value entered
	var imgFile, ytubeUrl;
	var myId, atomObj;
	
	// what to show as default picture
	var defaultPicUrl = 'app/res/icon/icon-preview.jpg';
	
	var listener = undefined;
	var isNewlyAdded = true;
	var previewDiv, imageDiv;
	var captCompUI ;
	
	// clipping (resize and crop)
	var aspectRatio, clipWidth, clipHeight, imageWidth;
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { items: 
		[
		{name:'.card', value:'margin-bottom:0px; border: 1px solid #dddddd;padding:0px;background-color:#f9f8f7' },
		]
	};
	
	/**
	 * YouTube share URL
	 */
	this.flow = { items: 
		[		
		{name:'youtube-dlg', lc:'App.Dialog', items:
			[
			{name:'youtube-form', lc:'App.FormHandler', 
				config:{title:'Embed YouTube Video', listener:this}, items: 
				[
				{html:'p', style:'font-size:100%', 
					 value:"YouTube video URL (copy and paste video link here)" },				
				{name:'youtubeUrl', ac:'App.TextField', info:'YouTue video URL', required:true, pattern:'text' },
				{html:'div', style:'height:6px;'},
				
			    {cmd:'cmdUTubeUrl', ac:'App.Button', label:'OK', config:{theme:'color'}},
			    {cmd:'cmdUTubeCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
				{html:'div', style:'height:6px;'}			    
				]
			}
			]
		}
		]
	};	
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * Config obj:
	 * prefWidth: preferred width number of pixels
	 * prefHeight: preferred height number if pixels
	 * youTube: allow you tube (true/false)
	 * btText: upload pic button text to show on button
	 * imgUrl: pass image Url (or icon id)
	 * imgCap: pass image caption
	 */
	this.createUI = function ( obj, config )
	{
		myId = this.compId;
		atomObj = obj;
		
		previewDiv = 'preview-' + myId;
		imageDiv = 'image-' + myId;
		
		// allow dialog to get created
		SA.listCreateUI ( myId, this.flow );
		
		// pref width and height
		var prefWidth = SA.getConfig ( obj, 'prefWidth' );
		var prefHeight = SA.getConfig ( obj, 'prefHeight' );
		aspectRatio = prefHeight / prefWidth;
		
		// get passed listener in config (if any)
		listener = SA.getConfig ( obj, 'listener' );
		
		// add Caption flag
		var addCap = SA.getConfig (obj, 'addCap');

		// get img caption of URL if passed
		var imgUrl = SA.getConfig (obj, 'imgUrl');
		var imgCap = SA.getConfig (obj, 'imgCap');
		if ( imgCap ) addCap = true;
		
		// add caption flag
		if ( addCap == true ) {
			captCompUI = getCaptCompUI (obj, imgCap);
		}
		
		var style = 'float:left;width:90px;font-size:90%;margin-right:5px;';
		if ( obj.style && obj.style.length> 0 )
			style = obj.style;
		
		var placeHolder = '';

		// get info
		if ( atomObj.info ) {
			placeHolder = 'placeholder="' + atomObj.info + '"'; 
		}
				
		var btText = SA.getConfig (obj, 'btText');
		if ( !btText ) {
			btText = 'Set Photo';
		}
		isNewlyAdded = true;
		
		// EDIT OP: assume the picture URL is in value 
		if ( imgUrl && imgUrl.length>0 ) {
			defaultPicUrl = App.util.getMediaUrl (imgUrl);
			// reset values
			atomObj.value = imgUrl;
			imgFle = undefined;
			isNewlyAdded = false;
			SA.fireEvent ( myId, { cmd:'loadExisting'} );
		}
		else {
			defaultPicUrl = 'app/res/icon/icon-preview.jpg';
		}
		
		var setPT = {name:'set-photo-'+myId, ac:'App.ButSmpl', style:style, 
				label:btText, config:{theme:'blank'} };
		/*
		var delPT = {name:'del-photo-'+myId, ac:'App.ButSmpl', style:'float:left;width:40px;font-size:90%;', 
				label:'Del', config:{theme:'blank'} };
		*/
		var setUT = {name:'set-utube-'+myId, ac:'App.ButSmpl', style:'font-size:90%;margin-right:5px;', 
				label:'YouTube', config:{theme:'blank'} };
		
		var remObj = {name:'rem-photo-'+myId, cmd:myId, ac:'App.Button', style:'font-size:90%;', 
				label:'Remove', config:{theme:'blank'} };
		
		var setPTHtml = SA.listCreateUI ( myId, setPT, null, true );
		setPTHtml = SA.injectClass ( setPTHtml, 'needsclick');
		
		//var delPTHtml = SA.listCreateUI ( myId, delPT, null, true );
		
		var setUTHtml = '';
		if ( SA.getConfig(obj, 'youTube') == true ) {
			var setUTHtml = SA.listCreateUI ( myId, setUT, null, true );
			setUTHtml = SA.injectClass ( setUTHtml, 'needsclick');
		}
		
		// get local css name (i.e. css name defined in this object)
		var cssCard = SA.localCss(this, 'card');
		
		var mediaHtml = '';
		if ( isEmbedVideoUrl ( defaultPicUrl ) ) {
			mediaHtml = App.util.getYouTubeHtml ( defaultPicUrl );
		}
		else {
			mediaHtml = '<img  class="img-responsive" src="' + defaultPicUrl + '">' ;
		}
		
		var html =
		'<div id="' + myId + '" class="form-group">'+ 
			'<div class="col-md-12">' +
				'<div id="' + previewDiv + '" style="display:none" class="' + cssCard + '">' +
					mediaHtml + 
				'</div>' +
				'<div>' + setPTHtml + '<div id="captf-' + myId + '" />' +  
					'<input type="file" id="file-' + myId + '" style="display:none" />' +
					setUTHtml +
					//remHtml +
				'</div>'+
			'</div>' +			
		'</div>';
		
		return html;
	}
	
	/*
	 * Create atom comp UI
	 */
	function getCaptCompUI (atObj, capVal)
	{
		var capValue = capVal;
		if ( !capValue ) capValue = '';
		var ctext = {name:'cap-'+myId, ac:'App.TextArea', info:'Set caption..', value:capValue, 
				config: {style:'border-color:#f5f5f5;font-size:90%;', rows:1} };
		return SA.createUI (myId, ctext);
	}
		
	/*
	 * True for embedded video URL
	 */
	function isEmbedVideoUrl ( url )
	{
		return url.indexOf ('youtu') > 0 ;
	}
	
	/**
	 * getValue() needed for FORM atom component (work with FormHandler)
	 */
	this.getValue = function ()
	{
		if ( ytubeUrl ) {
			return ytubeUrl;
		}
		
		if ( aspectRatio && aspectRatio>0 ) {
			var canvas = $( '#'+imageDiv ).cropper('getCroppedCanvas');
			if ( canvas.toDataURL ) {
				var url = canvas.toDataURL('image/png');
				var blobBin = atob(url.split(',')[1]);
				var array = [];
				for(var i = 0; i < blobBin.length; i++) {
				    array.push(blobBin.charCodeAt(i));
				}
				var file=new Blob([new Uint8Array(array)], {type: 'image/png'});
				return file;
			}
		}
		else if ( imgFile ) {
			return imgFile;
		}
		else if ( atomObj.value ) {
			return atomObj.value;
		}
	}
	
	/**
	 * getName() needed for FORM atom component  (work with FormHandler)
	 */
	this.getName = function()
	{
		return atomObj.name
	}
	
	/**
	 * Gets caption
	 */
	this.getCaption = function ()
	{
		var capComp = SA.lookupComponent ( 'cap-' + myId );
		return capComp.getValue();
	}
	
	/**
	 * Show a dialog with name
	 */
	function showDialog (  dialogName )
	{
		var dlg = SA.lookupComponent ( dialogName );
		if ( dlg ) {
			dlg.showDialog (true, '', 'appBanner' );
		}
		return dlg;
	}
	
	function hideDialog ()
	{
		var dlg = SA.lookupComponent ( 'youtube-dlg' );
		dlg.showDialog (false, '', 'appBanner');
	}	
	
	/**
	 * validation 
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			return false;
		}
		return true;
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdUTubeUrl' ) {
			if ( validate ( 'commMsg', atomList, dataObj ) ) {
				ytubeUrl =  dataObj.youtubeUrl;
				var embedHtml = App.util.getYouTubeHtml ( ytubeUrl );
				setPreviewHtml ( embedHtml );
			}
		}
		// hide dialog
		hideDialog ();
	}
	
	/**
	 * Handle async. event 
	 */
	this.handleEvent = function ( event ) 
	{
		// load existing image
		if ( event.cmd == 'loadExisting' ) {
			setPreviewImg ();
		}
		// refresh with new aspect ratio (when AP is provided)
		else if ( event.cmd == 'refresh' ) {
			var $pdiv = $('#'+previewDiv);
			var left = $pdiv.offset().left;
			var top = $pdiv.position().top;
			
			clipWidth = $pdiv.width() + 2;
			clipHeight = Math.round(clipWidth * aspectRatio);
	
			// image inside
			var $imageDiv = $( '#' + imageDiv );

			imageWidth = clipWidth;
			$pdiv.css ('height', clipHeight+'px')
			//no need to absolute positioning 
			//$pdiv.css ('position', 'absolute' );

			$imageDiv.cropper({
		        viewMode: 3,
		        dragMode: 'move',
		        autoCropArea: 1,
		        restore: false,
		        modal: false,
		        guides: false,
		        highlight: false,
		        cropBoxMovable: false,
		        cropBoxResizable: false,
		        built: function () {
		        	$imageDiv.cropper("setCropBoxData", {  width: clipWidth, height: clipHeight });			        
		        }
			});
		}
	}
	
	function clearImage ()
	{
		imgFile = undefined;
		setPreviewImg ( undefined );
		$( '#file-'+myId ).val ( '' );
	}
	
	/**
	 * Set img source to new image
	 */
	function setPreviewImg ( newImageSrc ) 
	{
		var html;

		var imgStyle = 'class="img-responsive"';

		if ( !newImageSrc ) {
			html = '<img ' + imgStyle + ' id="' + imageDiv +'" src="' + defaultPicUrl + '">';
		}
		else {
			html = '<img ' + imgStyle + ' id="' + imageDiv +'" src="' + newImageSrc + '">';			
		}
		setPreviewHtml ( html );
		
		if ( listener && listener.performAction ) {
			if ( isNewlyAdded == true ) {
				listener.performAction ( myId, {cmd:'imgAdded'}, this );
				isNewlyAdded = false;
			}
			else if ( isNewlyAdded == false ) {
				listener.performAction ( myId, {cmd:'imgUpdated'}, this );
			}
		}
	}
	
	/**
	 * Set img source to new image
	 */
	function setPreviewHtml ( newHtml ) 
	{
		// show preview div
		var $prev = $('#' + previewDiv );
		$prev.html ( newHtml );
		$prev.fadeIn ( 'slow' );

		var $cap = $( '#captf-' + myId );
		var top = 5;
		
		var btPhoto = SA.lookupComponent ('set-photo-'+myId);
		btPhoto.setLabel ('Change', 
				{background:'rgba(200,200,200,0.4)', 'color':'black', 'border-color':'silver', width:'70px'} );
		btPhoto.moveTo ( $prev.position().left+5, top );
		
		// show caption comp
		if ( captCompUI ) {
			$cap.html ( captCompUI );
			
			// refresh caption component
			var capComp = SA.lookupComponent ('cap-'+myId);
			if ( capComp ) 
				capComp.refresh ();
		}
		
		// only to handle (image resize and crop) 
		if ( aspectRatio && aspectRatio>0 ) {
			SA.fireEvent ( myId, {cmd:'refresh'} );
		}
	}
	
	/**
	 * Page just loaded this component
	 */
	this.postLoad = function ()
	{
		var $setPhoto = $( '#set-photo-'+myId);
		var $delPhoto = $( '#del-photo-'+myId);
		var $upload   = $( '#file-'+myId );
		var $setUTube = $( '#set-utube-'+myId);
		
		// do tap instead of click
		$setPhoto.hammer().bind("tap", function(event) {
			ytubeUrl = undefined;
			$upload.trigger('click');
		});
		
		// set youtube click event 
		$setUTube.click ( function (event) {
			showDialog ( 'youtube-dlg' );
		});
		
		// click on del
		$delPhoto.click (function (event) {
			listener.performAction ( myId, {cmd:'imgRemoved'}, this );
		});
		
		// upload photo changed event (when file is opened)
		$upload.change ( function (e) {
			e.preventDefault();

			imgFile = this.files[0],
			reader = new FileReader();
			reader.onload = function (event) {
				setPreviewImg ( event.target.result );
			};
			if ( imgFile ) {
				reader.readAsDataURL(imgFile);
			}
			return false;
		});
	}	
}

;
/**
 * Variable component
 */
App.Variable = function ()
{	
	var atom = undefined;
	
	/**
	 * This method creates the UI based on the lists provided
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		atom = atomObj;
		return '';
	}
	
	this.getName = function ()
	{
		return atom.name;
	}
	
	this.getValue = function ()
	{
		return atom.value;
	}
	
	this.setValue = function (val)
	{
		atom.value = val;
	}
}
