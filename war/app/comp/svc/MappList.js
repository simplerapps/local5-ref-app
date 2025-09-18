/**
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
			';border-style:dashed;border-width:1px;border-radius:8px;border-color:#d0d0d0;' + visStr + '" >' +
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
