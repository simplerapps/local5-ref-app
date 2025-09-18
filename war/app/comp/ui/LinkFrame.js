
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

