/**
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
			'text-align:center;font-size:190%;color:#f8a543;padding-top:22px;margin-bottom:-56px;' + 
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
