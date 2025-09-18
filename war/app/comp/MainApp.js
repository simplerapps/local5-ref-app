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
    //SA.setAppConfig ( {appName:'Local5app', hostName:'https://ea1-dot-local5service.appspot.com'} );
    SA.setAppConfig ( {appName:'Local5app', hostName:'http://localhost:8888'} );
    
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

