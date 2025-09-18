/**
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
