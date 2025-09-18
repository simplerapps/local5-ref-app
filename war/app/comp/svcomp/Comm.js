/**
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
