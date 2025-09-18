
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
