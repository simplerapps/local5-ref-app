/**
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
		
		// SEANOTE: At this point you can create a custom service if there is a custom component 
		// defined. 
		
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
